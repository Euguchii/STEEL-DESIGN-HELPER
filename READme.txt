LOCAL WEB SERVER SETUP
This package contains a batch script that makes it easy to host your web files locally for development and testing purposes.
WHAT THIS SCRIPT DOES
The start_local_server.bat script will:

Check if Python is already installed on your system
If Python is found, start a local web server on port 8000 and open your browser to http://localhost:8000
If Python is not found, automatically download and install Python for you
After installation, start the web server and open your browser
If Python installation fails, fall back to opening the HTML file directly (though this may have limitations with JavaScript)

INSTRUCTIONS
Quick Start:

Place the start_local_server.bat script in the same folder as your website files (where your index.html is located)
Double-click the start_local_server.bat script to run it
Your default web browser will automatically open to http://localhost:8000
To stop the server when you're done, press Ctrl+C in the command prompt window, then press Y to confirm

NOTES

The server will serve all files in the directory where the script is run
The script requires admin privileges if Python needs to be installed
Internet access is required for the automatic Python installation (approximately 25-30MB download)
The script will not reinstall Python if it's already present on your system

TROUBLESHOOTING
If you encounter issues:

Python installation fails: You may need to manually install Python from python.org
Port 8000 is already in use: Close any applications that might be using this port, or edit the script to use a different port
Admin rights: If you get permission errors during Python installation, right-click the script and select "Run as administrator"

FILES INCLUDED

start_local_server.bat - The main script to run
README.txt - This instruction file
Your website files (HTML, CSS, JavaScript, etc.)

FOR DEVELOPERS
If you need to customize the script:

Change the port number (default: 8000) by editing the Python command in the script
Modify the Python version to be installed by changing the download URL
Add additional server options by modifying the Python server command