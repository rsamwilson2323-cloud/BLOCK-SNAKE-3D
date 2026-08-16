@echo off
cd /d "%~dp0"

:: Start the local web server silently in the background
start /B powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File server.ps1 > server.log 2>&1

:: Wait a second for the server to start
ping 127.0.0.1 -n 2 > nul

:: Launch Microsoft Edge in "App Mode" (No address bar, no tabs, standalone window)
start /wait msedge --app=http://localhost:8000

:: Once the user closes the game window, kill the background server
wmic process where "name='powershell.exe' and commandline like '%%server.ps1%%'" call terminate > nul 2>&1
