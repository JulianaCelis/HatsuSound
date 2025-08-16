@echo off
echo 🚀 Iniciando base de datos PostgreSQL con Docker...

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo. Por favor inicia Docker primero.
    pause
    exit /b 1
)

REM Levantar los servicios
echo 📦 Levantando servicios de base de datos...
docker-compose up -d

REM Esperar a que PostgreSQL esté listo
echo ⏳ Esperando a que PostgreSQL esté listo...
timeout /t 10 /nobreak >nul

REM Verificar que PostgreSQL esté corriendo
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Error al iniciar la base de datos
    pause
    exit /b 1
) else (
    echo ✅ Base de datos iniciada exitosamente!
    echo 📊 PostgreSQL corriendo en: localhost:5432
    echo 🔧 PgAdmin disponible en: http://localhost:5050
    echo    - Email: admin@hatsusound.com
    echo    - Password: admin
)

echo.
echo 💡 Para detener la base de datos, ejecuta: docker-compose down
echo 💡 Para ver logs: docker-compose logs -f postgres
pause
