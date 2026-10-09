@echo off
title ElevenOS - Open Source ElevenLabs Alternative
echo ===================================================
echo   Starting ElevenOS Open-Source Studio...
echo ===================================================

if not exist node_modules (
    echo Installing dependencies...
    call npm.cmd install
)

echo Opening Web UI in your browser...
start http://localhost:7860

echo Starting Server...
node server.js
pause
