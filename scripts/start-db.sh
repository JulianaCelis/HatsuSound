#!/bin/bash

echo "🚀 Iniciando base de datos PostgreSQL con Docker..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
    exit 1
fi

# Levantar los servicios
echo "📦 Levantando servicios de base de datos..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar que PostgreSQL esté corriendo
if docker-compose ps | grep -q "Up"; then
    echo "✅ Base de datos iniciada exitosamente!"
    echo "📊 PostgreSQL corriendo en: localhost:5432"
    echo "🔧 PgAdmin disponible en: http://localhost:5050"
    echo "   - Email: admin@hatsusound.com"
    echo "   - Password: admin"
else
    echo "❌ Error al iniciar la base de datos"
    exit 1
fi

echo ""
echo "💡 Para detener la base de datos, ejecuta: docker-compose down"
echo "💡 Para ver logs: docker-compose logs -f postgres"
