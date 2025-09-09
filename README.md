# HatsuSound Backend

Backend con arquitectura hexagonal para HatsuSound usando NestJS, TypeORM y PostgreSQL.

## 🚀 Características

- **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- **NestJS Framework**: Framework moderno y escalable para Node.js
- **TypeORM**: ORM robusto con soporte para PostgreSQL
- **JWT Authentication**: Sistema de autenticación seguro
- **Wompi Integration**: Integración con pasarela de pagos Wompi
- **Railway Oriented Programming**: Manejo de errores funcional
- **Swagger Documentation**: API documentada automáticamente

## 🏗️ Arquitectura

```
src/
├── domain/           # Entidades y lógica de negocio
├── application/      # Casos de uso y servicios de aplicación
└── infrastructure/   # Implementaciones concretas (DB, HTTP, etc.)
```

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd HatsuSound

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Iniciar base de datos
npm run db:start

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeds (opcional)
npm run db:seed

# Iniciar aplicación
npm run start:dev
```

## 🔧 Scripts Disponibles

### Desarrollo
- `npm run start:dev` - Iniciar en modo desarrollo
- `npm run build` - Construir aplicación
- `npm run lint` - Ejecutar linter
- `npm run format` - Formatear código

### Base de Datos
- `npm run db:start` - Iniciar PostgreSQL con Docker
- `npm run db:stop` - Detener PostgreSQL
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Ejecutar seeds

### Testing
- `npm run test` - Ejecutar tests unitarios
- `npm run test:e2e` - Ejecutar tests E2E
- `npm run test:checkout:unit` - Tests unitarios del checkout
- `npm run test:checkout:e2e` - Tests E2E del checkout
- `npm run test:checkout:all` - Todos los tests del checkout
- `npm run test:checkout` - Script manual de testing (requiere JWT token)

### Wompi
- `npm run wompi:validate` - Validar configuración de Wompi

## 🧪 Suite de Testing

### Tests Unitarios ✅
- **Ubicación**: `test/checkout.use-case.spec.ts`
- **Cobertura**: 14 tests que cubren:
  - Creación exitosa de checkout (intent y direct)
  - Validación de datos de entrada
  - Manejo de errores de Wompi
  - Mapeo de estados de transacciones
  - Generación de referencias y descripciones

### Tests E2E ✅
- **Ubicación**: `test/checkout.e2e-spec.ts`
- **Cobertura**: 3 tests que cubren:
  - Checkout sin token (intent)
  - Checkout con token (direct)
  - Manejo de errores de validación

### Script Manual de Testing ✅
- **Ubicación**: `src/scripts/test-checkout.ts`
- **Uso**: `npm run test:checkout`
- **Requisito**: JWT token válido en variable de entorno `JWT_TOKEN`

## 🔐 Autenticación

Para usar el script manual de testing, necesitas un JWT token válido:

```bash
# Obtener token desde Swagger UI o endpoint de login
export JWT_TOKEN="tu_jwt_token_aqui"

# Ejecutar tests
npm run test:checkout
```

## 📊 Estado del Proyecto

### ✅ Implementado y Funcionando
- Arquitectura hexagonal completa
- Sistema de checkout con Wompi
- Soporte para pagos directos e intent
- Tests unitarios completos
- Tests E2E simplificados
- Script manual de testing
- Validación de datos robusta
- Manejo de errores funcional

### 🔄 En Desarrollo
- Tests E2E completos con base de datos real
- Integración completa con Wompi en producción

## 🌐 Endpoints Principales

### Checkout
- `POST /checkout` - Crear sesión de checkout
- `POST /checkout/wompi/create-token` - Crear token de método de pago (admin)

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/refresh` - Renovar token

## 📝 Variables de Entorno

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hatsusound

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Wompi
WOMPI_PUBLIC_KEY=your_wompi_public_key
WOMPI_PRIVATE_KEY=your_wompi_private_key
WOMPI_ENVIRONMENT=test
```

## 🚀 Despliegue

### **Verificación Previa**
```bash
# Verificar que todo esté listo para despliegue
npm run check:deployment
```

### **Despliegue Local**
```bash
# Construir para producción
npm run build

# Iniciar en producción
npm run start:prod
```

### **Despliegue en Render**
Tu proyecto está configurado para desplegarse automáticamente en Render:

1. **Conectar repositorio** a Render (Blueprint)
2. **Configurar variables de entorno** (ver `render-setup.md`)
3. **Desplegar automáticamente**

Para más detalles, consulta: [render-setup.md](render-setup.md)

## 📚 Documentación Adicional

- [API Usage Examples](docs/API_USAGE_EXAMPLES.md)
- [Wompi Configuration](docs/WOMPI_CONFIGURATION.md)
- [Security Guidelines](SECURITY.md)
- [Architecture Details](ARCHITECTURE.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.