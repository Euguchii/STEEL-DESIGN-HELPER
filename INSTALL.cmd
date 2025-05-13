@echo off
echo STEEL DESIGN HELPER - Updater
echo ===========================
echo.

set "current_dir=%~dp0"
set "download_dir=%current_dir%download"
set "zip_file=%download_dir%\steel_design_helper.zip"

echo Checking for download directory...
if not exist "%download_dir%" mkdir "%download_dir%"
echo.

echo Downloading the latest version from GitHub...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/Euguchii/STEEL-DESIGN-HELPER/archive/refs/heads/main.zip' -OutFile '%zip_file%'}"

if not exist "%zip_file%" (
    echo Failed to download files from GitHub.
    echo Please check your internet connection and try again.
    goto :end
)

echo Files downloaded successfully!
echo.
echo Extracting files...

REM Remove existing extracted directory if it exists
if exist "%download_dir%\STEEL-DESIGN-HELPER-main" rmdir /S /Q "%download_dir%\STEEL-DESIGN-HELPER-main"

REM Extract the ZIP file using PowerShell
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%zip_file%', '%download_dir%')}"

echo Copying files to current directory...
xcopy /E /Y "%download_dir%\STEEL-DESIGN-HELPER-main\*" "%current_dir%"

echo Cleaning up...
echo Deleting zip file...
del "%zip_file%"
echo Deleting extracted directory...
rmdir /S /Q "%download_dir%\STEEL-DESIGN-HELPER-main"

echo.
echo Files updated successfully!
echo.
echo All files have been updated to the latest version.

:end
echo.
echo Press any key to exit...
pause > nul