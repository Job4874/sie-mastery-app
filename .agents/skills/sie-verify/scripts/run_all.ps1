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
    Invoke-Step "1. py_compile + JS syntax + content schema" {
        python -m py_compile server.py security.py tts_engine.py tools/content_lib.py tools/validate_content.py tools/verify.py tools/compose_audio.py tools/verify_bits.py tools/verify_dom.py tools/verify_exhaustive.py tools/verify_hell.py tools/verify_asymmetric.py tools/visual_capture.py tools/launch.py tests/test_security.py tests/grammar_audit.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        python tools/validate_content.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        Get-ChildItem static\js -Recurse -Filter *.js | ForEach-Object {
            node --check $_.FullName
            if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        }
    }
    Invoke-Step "2. tests/app.test.js" { node tests/app.test.js }
    Invoke-Step "3. tests/tests9.js" { node tests/tests9.js }
    Invoke-Step "4. tests/ml_verify.js" { node tests/ml_verify.js }
    Invoke-Step "5. tests/ui_enterprise.js" { node tests/ui_enterprise.js }
    Invoke-Step "6. tools/verify.py" { python tools/verify.py }
    Invoke-Step "7. tests/grammar_audit.py" { python tests/grammar_audit.py }
    Invoke-Step "8. unittest test_security.py" { python -m unittest discover -s tests -p "test_*.py" -v }

    $srv = $null
    $prevPort = $env:PORT
    $prevBase = $env:SIE_BASE
    try {
        $probe = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 8765)
        try {
            $probe.Start()
            $Port = 8765
        } catch {
            $probe2 = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
            $probe2.Start()
            $Port = ([System.Net.IPEndPoint]$probe2.LocalEndpoint).Port
            $probe2.Stop()
        } finally {
            try { $probe.Stop() } catch {}
        }
        $env:PORT = "$Port"
        $env:SIE_BASE = "http://127.0.0.1:$Port"
        Write-Host "`n=== Starting temporary server.py on $env:SIE_BASE ==="
        $srv = Start-Process -FilePath "python" -ArgumentList "server.py" -WorkingDirectory $Root -PassThru -WindowStyle Hidden
        $ready = $false
        for ($i = 0; $i -lt 50; $i++) {
            Start-Sleep -Milliseconds 200
            if ($srv.HasExited) {
                throw "Temporary server.py exited early with code $($srv.ExitCode) on port $Port"
            }
            try {
                $resp = Invoke-WebRequest -Uri "$env:SIE_BASE/api/health" -UseBasicParsing -TimeoutSec 2
                if ($resp.StatusCode -eq 200) {
                    $ready = $true
                    break
                }
            } catch {
            }
        }
        if (-not $ready) {
            throw "Temporary server.py did not respond on $env:SIE_BASE/api/health within 10s"
        }

        Invoke-Step "9. tools/verify_dom.py" { python tools/verify_dom.py }
        Invoke-Step "10. tools/verify_exhaustive.py" { python tools/verify_exhaustive.py }
        Invoke-Step "11. tools/verify_hell.py" { python tools/verify_hell.py }
        Invoke-Step "12. tools/verify_asymmetric.py (browser + hardware + security)" { python tools/verify_asymmetric.py --use-running-server }
        Invoke-Step "13a. tools/verify_bits.py (pass 1)" { python tools/verify_bits.py }
        $hash1 = (Get-FileHash (Join-Path $Root "tools/bit_manifest.json") -Algorithm SHA256).Hash
        Invoke-Step "13b. tools/verify_bits.py (pass 2)" { python tools/verify_bits.py }
        $hash2 = (Get-FileHash (Join-Path $Root "tools/bit_manifest.json") -Algorithm SHA256).Hash
        if ($hash1 -ne $hash2) {
            throw "tools/bit_manifest.json is not idempotent across consecutive runs ($hash1 vs $hash2)"
        }
        Write-Host "`nPASS: tools/bit_manifest.json idempotent SHA-256 = $hash2"
    } finally {
        if ($null -ne $prevPort) { $env:PORT = $prevPort } else { Remove-Item Env:PORT -ErrorAction SilentlyContinue }
        if ($null -ne $prevBase) { $env:SIE_BASE = $prevBase } else { Remove-Item Env:SIE_BASE -ErrorAction SilentlyContinue }
        if ($srv -and -not $srv.HasExited) {
            Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue
            $srv.WaitForExit(5000) | Out-Null
            Write-Host "Stopped temporary test server.py (PID $($srv.Id))."
        }
        python tools/launch.py --no-browser
    }

    Write-Host "`n=== ALL 13 SIE-VERIFY SUITES PASSED (LOCALHOST 127.0.0.1:8765 ACTIVE) ==="
} finally {
    Pop-Location
}
