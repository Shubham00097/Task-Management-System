@echo off
echo ===== Installing Backend Dependencies =====
cd /d "f:\assignment\backend"
call npm install
if %errorlevel% neq 0 (echo [ERROR] Backend npm install failed & exit /b 1)

echo.
echo ===== Running Prisma Migration =====
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (echo [ERROR] Prisma migration failed & exit /b 1)

echo.
echo ===== Installing Frontend Dependencies =====
cd /d "f:\assignment\frontend"
call npm install
if %errorlevel% neq 0 (echo [ERROR] Frontend npm install failed & exit /b 1)

echo.
echo ===== All Done! =====
echo Backend: cd f:\assignment\backend  ^&^& npm run dev
echo Frontend: cd f:\assignment\frontend ^&^& npm run dev
