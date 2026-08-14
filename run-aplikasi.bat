@echo off
echo Menjalankan Aplikasi Import Data Armada...
echo Sedang menyiapkan server (Next.js) di port 3001...

:: Buka browser secara otomatis ke http://localhost:3001
start http://localhost:3001

:: Jalankan server development di port 3001
npm run dev -- -p 3001

pause
