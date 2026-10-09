@echo off
title Apex Nigeria HRMS Launcher
cd /d "%~dp0"
echo ========================================================
echo        Starting Apex Nigeria Enterprise HRMS
echo ========================================================
echo.
echo Database: SQLite (hrm_enterprise.db)
echo Server:   http://localhost:8080
echo.
python server.py
pause
