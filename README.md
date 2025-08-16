# HatsuSound Backend

Backend con arquitectura hexagonal (puertos y adaptadores) usando NestJS, TypeScript, Jest y PostgreSQL.

## 🏗️ Arquitectura

Este proyecto sigue los principios de la **Arquitectura Hexagonal** (también conocida como Arquitectura de Puertos y Adaptadores):

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Controllers │  │  Services   │  │    Repositories     │ │
│  │ (Adapters)  │  │ (Adapters)  │  │    (Adapters)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Use Cases                            │ │
│  │              (Application Services)                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Entities   │  │  Services   │  │    Repositories     │ │
│  │             │  │ (Ports)     │  │     (Ports)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Capas:

- **Domain Layer**: Entidades de negocio, interfaces de repositorios y servicios
- **Application Layer**: Casos de uso y lógica de aplicación
- **Infrastructure Layer**: Implementaciones concretas (controladores, servicios, repositorios)

## 🚀 Tecnologías

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Testing**: Jest
- **Documentación**: Swagger/OpenAPI
- **Autenticación**: JWT + Passport

## 📁 Estructura del Proyecto

```
src/
├── domain/                    # Capa de dominio
│   ├── entities/             # Entidades de negocio
│   ├── repositories/         # Interfaces de repositorios
│   └── services/             # Interfaces de servicios
├── application/              # Capa de aplicación
│   └── use-cases/           # Casos de uso
├── infrastructure/           # Capa de infraestructura
│   ├── database/            # Configuración de base de datos
│   ├── controllers/         # Controladores HTTP
│   ├── services/            # Implementaciones de servicios
│   ├── repositories/        # Implementaciones de repositorios
│   ├── config/              # Configuraciones
│   └── common/              # Utilidades comunes
└── main.ts                  # Punto de entrada
```

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd HatsuSound
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar base de datos**
   - Crear base de datos PostgreSQL
   - Actualizar variables de entorno en `.env`

5. **Ejecutar migraciones**
   ```bash
   npm run db:migrate
   ```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run start:dev          # Ejecutar en modo desarrollo
npm run start:debug        # Ejecutar en modo debug

# Producción
npm run build              # Compilar el proyecto
npm run start:prod         # Ejecutar en modo producción

# Testing
npm run test               # Ejecutar tests unitarios
npm run test:watch         # Ejecutar tests en modo watch
npm run test:cov           # Ejecutar tests con cobertura
npm run test:e2e           # Ejecutar tests end-to-end

# Base de datos
npm run db:migrate         # Ejecutar migraciones
npm run db:revert          # Revertir migraciones
npm run db:generate        # Generar nueva migración

# Linting y formateo
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier
```

## 📊 Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hatsusound
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

## 🧪 Testing

El proyecto incluye configuración completa para testing:

- **Jest** para tests unitarios e integración
- **Supertest** para tests de API
- **Cobertura de código** configurada
- **Tests E2E** configurados

## 📚 Documentación API

Una vez ejecutada la aplicación, la documentación Swagger estará disponible en:

```
http://localhost:3000/api
```

## 🔧 Desarrollo

### Crear nueva entidad

1. Crear entidad en `src/domain/entities/`
2. Crear interfaz de repositorio en `src/domain/repositories/`
3. Crear interfaz de servicio en `src/domain/services/`
4. Crear caso de uso en `src/application/use-cases/`
5. Implementar repositorio en `src/infrastructure/repositories/`
6. Implementar servicio en `src/infrastructure/services/`
7. Crear controlador en `src/infrastructure/controllers/`
8. Configurar módulo correspondiente

### Estructura de un módulo típico

```
feature/
├── feature.entity.ts           # Entidad de dominio
├── feature.repository.interface.ts  # Puerto del repositorio
├── feature.service.interface.ts     # Puerto del servicio
├── feature.use-case.ts         # Caso de uso
├── feature.repository.ts        # Adaptador del repositorio
├── feature.service.ts           # Adaptador del servicio
├── feature.controller.ts        # Adaptador del controlador
└── feature.module.ts            # Módulo NestJS
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.
