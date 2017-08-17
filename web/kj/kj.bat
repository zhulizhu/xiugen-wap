@echo off
start 1.bat
start 2.bat
ping -n 120 127.1>nul
taskkill /f /t /im node.exe
ping -n 1 127.1>nul
taskkill /f /t /im cmd.exe

