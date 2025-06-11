@echo off
chcp 65001 > nul
title VS_LAB Store - Запуск

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    VS_LAB STORE LAUNCHER                     ║
echo ║              Лаборатория Архитектурных Решений               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Создание папки для логов
if not exist "logs" mkdir logs

:: Логирование
set LOG_FILE=logs\start_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log
echo [%date% %time%] Запуск VS_LAB Store >> %LOG_FILE%

echo [1/5] Проверка Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден! Установите Node.js с https://nodejs.org/
    echo [%date% %time%] ERROR: Node.js не найден >> %LOG_FILE%
    pause
    exit /b 1
)
echo ✅ Node.js найден

echo.
echo [2/5] Установка зависимостей...
echo Установка зависимостей фронтенда...
call npm install >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей фронтенда
    echo [%date% %time%] ERROR: npm install failed >> %LOG_FILE%
    pause
    exit /b 1
)
echo ✅ Зависимости фронтенда установлены

echo.
echo [3/5] Сборка фронтенда...
call npm run build >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ❌ Ошибка сборки фронтенда
    echo [%date% %time%] ERROR: npm run build failed >> %LOG_FILE%
    pause
    exit /b 1
)
echo ✅ Фронтенд собран

echo.
echo [4/5] Установка зависимостей бэкенда...
cd scripts
call npm init -y > nul 2>&1
call npm install express cors jsonwebtoken crypto >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей бэкенда
    echo [%date% %time%] ERROR: Backend dependencies failed >> %LOG_FILE%
    cd ..
    pause
    exit /b 1
)
echo ✅ Зависимости бэкенда установлены
cd ..

echo.
echo [5/5] Запуск сервера...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🚀 VS_LAB Store запускается...                             ║
echo ║                                                              ║
echo ║  Frontend: http://localhost:3000                             ║
echo ║  Backend:  http://localhost:3001                             ║
echo ║                                                              ║
echo ║  Для остановки нажмите Ctrl+C                               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Запуск бэкенда в фоне
start /b node scripts/server.js >> %LOG_FILE% 2>&1

:: Ожидание запуска бэкенда
timeout /t 3 /nobreak > nul

:: Запуск фронтенда
echo [%date% %time%] Запуск фронтенда >> %LOG_FILE%
call npm run dev

echo.
echo [%date% %time%] VS_LAB Store остановлен >> %LOG_FILE%
echo Спасибо за использование VS_LAB Store!
pause
