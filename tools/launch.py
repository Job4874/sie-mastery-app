"""On-demand loopback launcher and Windows Desktop/Start Menu shortcut installer for SIE Mastery.

Usage:
  pythonw tools/launch.py                 # Start 127.0.0.1:8765 if needed, then open browser
  python  tools/launch.py --no-browser    # Start/verify local server without opening browser
  python  tools/launch.py --stop          # Stop local SIE Mastery server cleanly (zero open ports)
  python  tools/launch.py --install-shortcuts  # Create Desktop & Start Menu shortcuts (.lnk)
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get("PORT", "8765"))
HOST = "127.0.0.1"
BASE = f"http://{HOST}:{PORT}"
APP_URL = f"{BASE}/#/learn"
PID_FILE = ROOT / ".sie_server.pid"


def health_ok(timeout: float = 1.5) -> dict | None:
    try:
        with urllib.request.urlopen(f"{BASE}/api/health", timeout=timeout) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("ok") is True:
                    return data
    except (OSError, ValueError, urllib.error.URLError):
        return None
    return None


def find_python(windowless: bool = True) -> str:
    exe_name = "pythonw.exe" if (os.name == "nt" and windowless) else ("python.exe" if os.name == "nt" else "python3")
    venv_py = ROOT / ".venv" / ("Scripts" if os.name == "nt" else "bin") / exe_name
    if venv_py.is_file():
        return str(venv_py)
    cur = Path(sys.executable)
    if os.name == "nt" and windowless:
        pyw = cur.with_name("pythonw.exe")
        if pyw.is_file():
            return str(pyw)
    return str(cur)


def start_server(wait_sec: float = 12.0) -> dict:
    existing = health_ok()
    if existing:
        return existing

    py_exe = find_python(windowless=True)
    env = dict(os.environ, PORT=str(PORT))
    kwargs: dict = {
        "cwd": str(ROOT),
        "env": env,
        "stdin": subprocess.DEVNULL,
        "stdout": subprocess.DEVNULL,
        "stderr": subprocess.DEVNULL,
        "close_fds": True,
    }
    if os.name == "nt":
        # Never combine DETACHED_PROCESS with CREATE_NO_WINDOW per Win32 CreateProcess docs.
        flags = (
            getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)
            | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0x00000200)
        )
        kwargs["creationflags"] = flags
    else:
        kwargs["start_new_session"] = True

    proc = subprocess.Popen([py_exe, str(ROOT / "server.py")], **kwargs)
    try:
        PID_FILE.write_text(str(proc.pid), encoding="utf-8")
    except OSError:
        pass

    deadline = time.monotonic() + wait_sec
    while time.monotonic() < deadline:
        info = health_ok(timeout=1.0)
        if info:
            return info
        if proc.poll() is not None:
            raise RuntimeError(f"server.py exited early with code {proc.returncode}")
        time.sleep(0.15)
    raise TimeoutError(f"server.py did not respond on {BASE}/api/health within {wait_sec}s")


def stop_server() -> int:
    stopped = 0
    pids: set[int] = set()
    if PID_FILE.is_file():
        try:
            pids.add(int(PID_FILE.read_text(encoding="utf-8").strip()))
        except (OSError, ValueError):
            pass

    if os.name == "nt":
        ps = (
            "Get-CimInstance Win32_Process | Where-Object { "
            "$_.Name -match '^pythonw?\\.exe$' -and $_.CommandLine -match 'sie-mastery-app.*server\\.py' "
            "} | ForEach-Object { $_.ProcessId }"
        )
        res = subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps],
            capture_output=True, text=True, check=False,
        )
        for line in res.stdout.splitlines():
            line = line.strip()
            if line.isdigit():
                pids.add(int(line))
        for pid in sorted(pids):
            r = subprocess.run(
                ["taskkill", "/PID", str(pid), "/F"],
                capture_output=True, text=True, check=False,
            )
            if r.returncode == 0:
                stopped += 1
    else:
        import signal
        for pid in sorted(pids):
            try:
                os.kill(pid, signal.SIGTERM)
                stopped += 1
            except OSError:
                pass

    try:
        PID_FILE.unlink(missing_ok=True)
    except OSError:
        pass
    return stopped


def install_shortcuts() -> list[Path]:
    if os.name != "nt":
        raise RuntimeError("--install-shortcuts is only supported on Windows")

    pyw = find_python(windowless=True)
    icon = ROOT / "static" / "favicon.ico"
    launch_script = ROOT / "tools" / "launch.py"
    if not icon.is_file():
        raise FileNotFoundError(f"Missing icon: {icon}")

    ps = f"""
$ErrorActionPreference = 'Stop'
$shell = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$programs = [Environment]::GetFolderPath('Programs')
$targets = @(
    (Join-Path $desktop 'SIE Mastery.lnk'),
    (Join-Path $programs 'SIE Mastery.lnk')
)
foreach ($lnkPath in $targets) {{
    $sc = $shell.CreateShortcut($lnkPath)
    $sc.TargetPath = '{pyw}'
    $sc.Arguments = '"{launch_script}"'
    $sc.WorkingDirectory = '{ROOT}'
    $sc.IconLocation = '{icon},0'
    $sc.Description = 'SIE Mastery - Launch local learning app on 127.0.0.1:8765'
    $sc.Save()
    Write-Output $lnkPath
}}
$oldUrl = Join-Path $desktop 'SIE Mastery.url'
if (Test-Path $oldUrl) {{
    Remove-Item $oldUrl -Force
}}
"""
    res = subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps],
        capture_output=True, text=True, check=True,
    )
    return [Path(line.strip()) for line in res.stdout.splitlines() if line.strip()]


def _log(msg: str) -> None:
    if sys.stdout is not None:
        try:
            print(msg)
        except OSError:
            pass


def main() -> int:
    parser = argparse.ArgumentParser(description="SIE Mastery local launcher")
    parser.add_argument("--no-browser", action="store_true", help="Start server without opening browser")
    parser.add_argument("--stop", action="store_true", help="Stop local SIE Mastery server")
    parser.add_argument("--install-shortcuts", action="store_true", help="Install Desktop and Start Menu shortcuts")
    args = parser.parse_args()

    if args.install_shortcuts:
        created = install_shortcuts()
        for p in created:
            _log(f"Installed shortcut: {p}")
        return 0

    if args.stop:
        n = stop_server()
        _log(f"Stopped {n} server process(es); port {PORT} closed: {health_ok(0.5) is None}")
        return 0

    info = start_server()
    if not args.no_browser:
        webbrowser.open(APP_URL)
    _log(f"SIE Mastery ready at {APP_URL} (engine={info.get('engine')}, ready={info.get('ready')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
