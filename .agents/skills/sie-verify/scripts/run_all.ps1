$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )
    Write-Host "`n=== [$Name] ==="
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Step '$Name' failed with exit code $LASTEXITCODE"
    }
}

Push-Location $Root
try {
    Invoke-Step "1. py_compile" {
        python -m py_compile server.py security.py tts_engine.py tools/verify.py tools/compose_audio.py tools/verify_bits.py tools/verify_dom.py tools/verify_exhaustive.py tests/test_security.py tests/grammar_audit.py
    }
    Invoke-Step "2. tests/app.test.js" { node tests/app.test.js }
    Invoke-Step "3. tests/tests9.js" { node tests/tests9.js }
    Invoke-Step "4. tests/ml_verify.js" { node tests/ml_verify.js }
    Invoke-Step "5. tests/ui_enterprise.js" { node tests/ui_enterprise.js }
    Invoke-Step "6. tools/verify.py" { python tools/verify.py }
    Invoke-Step "7. tests/grammar_audit.py" { python tests/grammar_audit.py }
    Invoke-Step "8. unittest test_security.py" { python -m unittest discover -s tests -p "test_*.py" -v }

    $srv = $null
    try {
        Write-Host "`n=== Starting temporary server.py on 127.0.0.1:8765 ==="
        $srv = Start-Process -FilePath "python" -ArgumentList "server.py" -WorkingDirectory $Root -PassThru -WindowStyle Hidden
        $ready = $false
        for ($i = 0; $i -lt 50; $i++) {
            Start-Sleep -Milliseconds 200
            if ($srv.HasExited) {
                throw "Temporary server.py exited early with code $($srv.ExitCode) (is port 8765 already in use?)"
            }
            try {
                $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8765/api/health" -UseBasicParsing -TimeoutSec 2
                if ($resp.StatusCode -eq 200) {
                    $ready = $true
                    break
                }
            } catch {
            }
        }
        if (-not $ready) {
            throw "Temporary server.py did not respond on http://127.0.0.1:8765/api/health within 10s"
        }

        Invoke-Step "9. tools/verify_dom.py" { python tools/verify_dom.py }
        Invoke-Step "10. tools/verify_exhaustive.py" { python tools/verify_exhaustive.py }
        Invoke-Step "11a. tools/verify_bits.py (pass 1)" { python tools/verify_bits.py }
        $hash1 = (Get-FileHash (Join-Path $Root "tools/bit_manifest.json") -Algorithm SHA256).Hash
        Invoke-Step "11b. tools/verify_bits.py (pass 2)" { python tools/verify_bits.py }
        $hash2 = (Get-FileHash (Join-Path $Root "tools/bit_manifest.json") -Algorithm SHA256).Hash
        if ($hash1 -ne $hash2) {
            throw "tools/bit_manifest.json is not idempotent across consecutive runs ($hash1 vs $hash2)"
        }
        Write-Host "`nPASS: tools/bit_manifest.json idempotent SHA-256 = $hash2"
    } finally {
        if ($srv -and -not $srv.HasExited) {
            Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue
            $srv.WaitForExit(5000) | Out-Null
            Write-Host "Stopped temporary server.py (PID $($srv.Id))."
        }
    }

    Write-Host "`n=== ALL 11 SIE-VERIFY SUITES PASSED ==="
} finally {
    Pop-Location
}
