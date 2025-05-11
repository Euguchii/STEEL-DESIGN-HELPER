@echo off
echo Starting local web server to host files...

REM Check if Python is installed for running a simple HTTP server
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Python to create a local web server...
    echo Access your application at: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Python3 to create a local web server...
    echo Access your application at: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    start "" http://localhost:8000
    python3 -m http.server 8000
    goto :end
)

REM If Python is not available, install it automatically
echo Python is not installed or not found in PATH.
echo Installing Python automatically...

REM Create a temporary directory
set "temp_dir=%TEMP%\python_installer"
mkdir "%temp_dir%" 2>nul

REM Download Python installer
echo Downloading Python installer...
powershell -Command "& {Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe' -OutFile '%temp_dir%\python_installer.exe'}"

if not exist "%temp_dir%\python_installer.exe" (
    echo Failed to download Python installer.
    goto :fallback
)

REM Install Python (silent mode, add to PATH)
echo Installing Python...
"%temp_dir%\python_installer.exe" /quiet PrependPath=1

REM Wait a bit for installation to complete
timeout /t 10 /nobreak

REM Check if Python is now installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python successfully installed!
    echo Using Python to create a local web server...
    echo Access your application at: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

:fallback
echo Python installation failed or was not completed.
echo.
echo WARNING: Opening files directly may cause JavaScript to fail when accessing local files
echo due to browser security restrictions. Consider installing Python manually.
echo.
echo Attempting to open files directly instead...
echo.

REM Get the full path of the current directory
set "current_dir=%~dp0"
set "html_file=%current_dir%index.html"
set "excel_file=%current_dir%ASTMSPEC.xlsx"

REM Check if files exist
if exist "%html_file%" (
    echo Opening index.html in your default browser...
    start "" "%html_file%"
) else (
    echo Warning: index.html not found in the current directory.
)

if exist "%excel_file%" (
    echo For reference, opening ASTMSPEC.xlsx in Excel...
    start "" "%excel_file%"
) else (
    echo Warning: ASTMSPEC.xlsx not found in the current directory.
)

:end
echo.
pause