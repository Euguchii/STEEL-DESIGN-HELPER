@echo off
setlocal enabledelayedexpansion

echo Starting setup for local web server...
echo.

REM Check if index.html exists in the current directory
if not exist "index.html" (
    echo ERROR: index.html not found in the current directory.
    echo Please make sure you're running this script from the same folder as your website files.
    goto error_exit
)

REM Check if Python is installed for running a simple HTTP server
echo Checking for Python installation...
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "python_cmd=python"
    goto verify_python
)

where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "python_cmd=python3"
    goto verify_python
)

REM Python is not available, install it automatically
echo Python is not installed or not found in PATH.
echo Installing Python automatically...

REM Create a temporary directory
set "temp_dir=%TEMP%\python_installer"
mkdir "%temp_dir%" 2>nul

REM Download Python installer
echo Downloading Python installer...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe' -OutFile '%temp_dir%\python_installer.exe'}"

if not exist "%temp_dir%\python_installer.exe" (
    echo Failed to download Python installer.
    goto fallback
)

REM Install Python (silent mode, add to PATH)
echo Installing Python...
"%temp_dir%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

REM Wait for installation to complete
echo Waiting for installation to complete...
echo This may take a few minutes...
timeout /t 30 /nobreak

REM Refresh environment variables to get the updated PATH
echo Refreshing environment variables...
call :refresh_env

REM Check if Python is now installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "python_cmd=python"
    goto verify_python
) else (
    echo Python installation may not have completed properly.
    goto fallback
)

:verify_python
echo Found Python. Verifying HTTP server module...
%python_cmd% -c "import http.server" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is installed but the http.server module is not available.
    goto fallback
)

REM Check for port availability
echo Checking if port 8000 is available...
netstat -an | find ":8000" >nul
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port 8000 seems to be in use.
    echo The server might not start properly.
    echo.
    set /p continue_choice="Do you want to continue anyway? (Y/N): "
    if /i "!continue_choice!" NEQ "Y" goto error_exit
)

:runserver
echo.
echo Python successfully verified!
echo Using Python to create a local web server...
echo Server will start in 3 seconds...
echo.
echo Access your application at: http://localhost:8000
echo Press Ctrl+C to stop the server when done.
echo.

REM Wait a moment before starting
timeout /t 3 /nobreak >nul

REM Start the browser after server starts (in background)
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

REM Start the server
echo Starting server...
%python_cmd% -m http.server 8000
goto clean_exit

:fallback
echo Python installation or verification failed.
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
    echo Note: ASTMSPEC.xlsx not found in the current directory.
)
goto clean_exit

:error_exit
echo.
echo Setup failed. Please check the errors above.

:clean_exit
echo.
echo Press any key to exit...
pause
endlocal
exit /b

:refresh_env
REM This subroutine refreshes environment variables
echo Refreshing PATH variable...
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH') do set "PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2>nul') do set "PATH=%%b;%PATH%"
exit /b