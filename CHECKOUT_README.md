# 🛒 HatsuSound Checkout System

## Descripción

El sistema de checkout de HatsuSound permite a los usuarios realizar pagos por productos de audio usando la pasarela de pagos Wompi. El sistema está implementado siguiendo la arquitectura hexagonal y utiliza NestJS como framework.

## 🚀 Características

- ✅ Integración completa con Wompi
- ✅ Manejo de transacciones en tiempo real
- ✅ Webhooks para actualizaciones de estado
- ✅ Sistema de roles y autenticación JWT
- ✅ Validación de datos con class-validator
- ✅ Documentación automática con Swagger
- ✅ Manejo de errores robusto
- ✅ Logging detallado

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controller    │    │   Use Case      │    │   Repository    │
│   (HTTP)        │───▶│   (Business)    │───▶│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      DTOs       │    │     Ports       │    │    Entities     │
│  (Validation)   │    │  (Interfaces)   │    │   (Domain)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=hatsusound

# Wompi
WOMPI_ENVIRONMENT=staging
WOMPI_PUBLIC_KEY=your_public_key
WOMPI_PRIVATE_KEY=your_private_key
WOMPI_EVENTS_KEY=your_events_key
WOMPI_INTEGRITY_KEY=your_integrity_key

# Application
PORT=3012
FRONTEND_URL=http://localhost:3000
```

### 2. Base de Datos

```bash
# Inicializar base de datos
npm run db:init          # Linux/Mac
npm run db:init:win      # Windows

# O manualmente:
npm run db:start         # Iniciar PostgreSQL
npm run migration:run    # Ejecutar migraciones
npm run seed:run         # Ejecutar seeds
```

## 📡 API Endpoints

### POST /checkout

Crea una nueva sesión de checkout.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 50000,
  "currency": "COP",
  "customerEmail": "customer@example.com",
  "customerName": "Juan Pérez",
  "customerPhone": "+573001234567",
  "description": "Compra de álbum musical",
  "metadata": {
    "productId": "123",
    "productName": "Álbum de Prueba"
  },
  "reference": "TXN-1755510920"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "reference": "TXN-1755510920",
    "amount": 50000,
    "currency": "COP",
    "status": "pending",
    "customerEmail": "customer@example.com"
  },
  "checkoutUrl": "https://api.co.uat.wompi.dev/v1/transactions/123"
}
```

### POST /checkout/webhook

Procesa webhooks de Wompi.

**Body:**
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "123",
      "status": "APPROVED",
      "reference": "TXN-1755510920"
    }
  }
}
```

### GET /checkout/status/:transactionId

Obtiene el estado de una transacción.

## 🔐 Autenticación

El checkout requiere autenticación JWT. Obtén un token:

```bash
# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Usar el token
Authorization: Bearer <JWT_TOKEN>
```

## 🧪 Testing

### 1. Probar el Checkout

```bash
# 1. Iniciar la aplicación
npm run start:dev

# 2. Obtener token JWT (usar Swagger o Postman)
# 3. Probar el endpoint /checkout con el token
```

### 2. Datos de Prueba

```json
{
  "amount": 50000,
  "currency": "COP",
  "customerEmail": "test@example.com",
  "customerName": "Usuario de Prueba",
  "customerPhone": "+573001234567",
  "description": "Test de checkout",
  "metadata": {
    "test": true
  }
}
```

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Causas posibles:**
1. Base de datos no está corriendo
2. Migraciones no ejecutadas
3. Variables de entorno incorrectas
4. Puerto ocupado

**Soluciones:**
```bash
# Verificar base de datos
npm run db:logs

# Reiniciar base de datos
npm run db:reset

# Verificar variables de entorno
cat .env

# Verificar puerto
lsof -i :3012
```

### Error: "Transaction creation failed"

**Causas posibles:**
1. Claves de Wompi incorrectas
2. Formato de datos inválido
3. Problemas de red con Wompi

**Soluciones:**
1. Verificar claves de Wompi en `.env`
2. Verificar formato de `amount` (debe estar en centavos)
3. Verificar conectividad con Wompi

## 📚 Recursos Adicionales

- [Documentación de Wompi](https://docs.wompi.co/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
