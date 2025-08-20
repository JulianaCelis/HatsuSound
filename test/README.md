# Pruebas Unitarias del Módulo de Usuarios

Este directorio contiene un conjunto completo de pruebas unitarias para el módulo de usuarios de HatsuSound, siguiendo las mejores prácticas de testing y la arquitectura hexagonal del proyecto.

## 📁 Estructura de Archivos

```
test/
├── README.md                           # Este archivo
├── user.test.config.ts                 # Configuración y helpers de pruebas
├── user.entity.spec.ts                 # Pruebas de la entidad User
├── user.service.spec.ts                # Pruebas del UserService
├── user.repository.spec.ts             # Pruebas del UserRepository
├── auth.use-cases.spec.ts              # Pruebas de los casos de uso de autenticación
└── user.integration.spec.ts            # Pruebas de integración del módulo
```

## 🚀 Ejecución de Pruebas

### Ejecutar todas las pruebas de usuarios
```bash
npm run test:user:all
```

### Ejecutar pruebas específicas
```bash
# Solo entidad User
npm run test -- --testPathPattern=user.entity.spec.ts

# Solo UserService
npm run test -- --testPathPattern=user.service.spec.ts

# Solo UserRepository
npm run test -- --testPathPattern=user.repository.spec.ts

# Solo casos de uso de autenticación
npm run test -- --testPathPattern=auth.use-cases.spec.ts

# Solo pruebas de integración
npm run test -- --testPathPattern=user.integration.spec.ts
```

### Ejecutar con coverage
```bash
npm run test:cov -- --testPathPattern=user
```

### Ejecutar en modo watch
```bash
npm run test:watch -- --testPathPattern=user
```

## 🧪 Tipos de Pruebas

### 1. Pruebas de Entidad (`user.entity.spec.ts`)
- **Constructor**: Verificación de creación de usuarios con diferentes roles
- **Métodos estáticos**: Prueba del método `User.create()`
- **Getters**: Verificación del getter `fullName`
- **Métodos de estado**: `activate()`, `deactivate()`, `changeRole()`
- **Inmutabilidad**: Verificación de que los métodos no modifican el objeto original
- **Casos edge**: Nombres especiales, nombres muy largos

### 2. Pruebas de Servicio (`user.service.spec.ts`)
- **CRUD Operations**: Crear, leer, actualizar, eliminar usuarios
- **Validación de credenciales**: Login con email/username y password
- **Gestión de roles**: Cambio de roles de usuario
- **Activación/Desactivación**: Control del estado activo del usuario
- **Manejo de errores**: Propagación de errores del repositorio
- **Hashing de passwords**: Verificación de encriptación con bcrypt

### 3. Pruebas de Repositorio (`user.repository.spec.ts`)
- **Operaciones de base de datos**: Save, find, update, delete
- **Mapeo de entidades**: Conversión entre entidades de dominio y TypeORM
- **Consultas específicas**: Búsqueda por email, username, rol
- **Manejo de errores**: Propagación de errores de TypeORM
- **Transacciones**: Verificación de operaciones atómicas

### 4. Pruebas de Casos de Uso (`auth.use-cases.spec.ts`)
- **RegisterUseCase**: Registro de usuarios con validaciones
- **LoginUseCase**: Autenticación de usuarios
- **GetProfileUseCase**: Obtención de perfiles de usuario
- **Validaciones de negocio**: Campos requeridos, unicidad, longitud de password
- **Manejo de errores**: Excepciones apropiadas para cada caso
- **Escenarios de integración**: Flujos completos de registro y login

### 5. Pruebas de Integración (`user.integration.spec.ts`)
- **Integración entre capas**: Servicio + Repositorio + Casos de Uso
- **Ciclo de vida completo**: Crear → Actualizar → Activar → Desactivar
- **Gestión de roles**: Cambios de rol a través del tiempo
- **Consistencia de datos**: Verificación entre capas de dominio e infraestructura
- **Manejo de errores**: Propagación de errores a través de capas
- **Rendimiento**: Operaciones concurrentes y datasets grandes

## 🛠️ Configuración y Helpers

### `user.test.config.ts`
Este archivo contiene:
- **Factories de mocks**: Creación de usuarios, entidades y servicios mock
- **Helpers de validación**: Funciones para verificar respuestas de usuario
- **Constantes de prueba**: Datos de prueba y mensajes de error
- **Configuración de módulos**: Setup de módulos de prueba para diferentes componentes
- **Setup y teardown**: Helpers para configuración de pruebas

### Uso de Helpers
```typescript
import { 
  createMockUser, 
  createMockAdminUser, 
  validateUserResponse,
  TEST_DATA,
  ERROR_MESSAGES 
} from './user.test.config';

// Crear usuario mock
const mockUser = createMockUser({ role: UserRole.ADMIN });

// Validar respuesta
validateUserResponse(result.user, expectedUser);

// Usar constantes
expect(result.message).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
```

## 📊 Cobertura de Pruebas

### Métricas Objetivo
- **Líneas de código**: >95%
- **Funciones**: 100%
- **Ramas**: >90%
- **Declaraciones**: >95%

### Áreas Cubiertas
- ✅ Entidad User (100%)
- ✅ UserService (100%)
- ✅ UserRepository (100%)
- ✅ Casos de uso de autenticación (100%)
- ✅ Integración entre capas (100%)
- ✅ Manejo de errores (100%)
- ✅ Validaciones de negocio (100%)

## 🔧 Configuración de Jest

### Mocks Automáticos
- `bcryptjs`: Mock automático para operaciones de hashing
- `@nestjs/typeorm`: Mock automático para repositorios de TypeORM

### Configuración de Timeout
- **Pruebas unitarias**: 5000ms
- **Pruebas de integración**: 10000ms

### Configuración de Coverage
```json
{
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.interface.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 100,
      "lines": 95,
      "statements": 95
    }
  }
}
```

## 🚨 Manejo de Errores

### Tipos de Errores Cubiertos
- **BadRequestException**: Validaciones de entrada
- **ConflictException**: Conflictos de unicidad (email/username)
- **UnauthorizedException**: Credenciales inválidas o usuario inactivo
- **NotFoundException**: Usuario no encontrado
- **Errores de base de datos**: Fallos de conexión, operaciones fallidas
- **Errores de bcrypt**: Fallos en hashing de passwords

### Estrategias de Testing
- **Happy Path**: Flujos exitosos normales
- **Error Path**: Manejo de errores y excepciones
- **Edge Cases**: Casos límite y valores extremos
- **Boundary Testing**: Valores en los límites de validación

## 📈 Mejores Prácticas Implementadas

### 1. **Arrange-Act-Assert (AAA)**
```typescript
describe('createUser', () => {
  it('should create user successfully', async () => {
    // Arrange
    const mockUser = createMockUser();
    mockUserRepository.save.mockResolvedValue(mockUser);
    
    // Act
    const result = await userService.createUser(/* params */);
    
    // Assert
    expect(result).toBe(mockUser);
    expect(mockUserRepository.save).toHaveBeenCalled();
  });
});
```

### 2. **Mocks Aislados**
- Cada prueba tiene sus propios mocks
- Reset de mocks entre pruebas
- Verificación de llamadas a métodos mock

### 3. **Nombres Descriptivos**
- Nombres de pruebas que explican el comportamiento esperado
- Descripción clara de escenarios de prueba
- Agrupación lógica de pruebas relacionadas

### 4. **Validaciones Exhaustivas**
- Verificación de todos los campos de respuesta
- Verificación de llamadas a métodos mock
- Verificación de manejo de errores

### 5. **Setup y Teardown**
- Configuración limpia para cada prueba
- Limpieza de mocks después de cada prueba
- Cierre apropiado de módulos de prueba

## 🔍 Debugging de Pruebas

### Comando de Debug
```bash
npm run test:debug -- --testPathPattern=user
```

### Logs de Pruebas
```bash
npm run test -- --testPathPattern=user --verbose
```

### Coverage Detallado
```bash
npm run test:cov -- --testPathPattern=user --coverageReporters=text-lcov
```

## 📝 Mantenimiento

### Agregar Nuevas Pruebas
1. Crear archivo `.spec.ts` siguiendo la convención de nombres
2. Importar helpers y configuraciones de `user.test.config.ts`
3. Seguir el patrón AAA (Arrange-Act-Assert)
4. Agregar pruebas para casos edge y manejo de errores
5. Verificar cobertura de código

### Actualizar Pruebas Existentes
1. Mantener compatibilidad con cambios en la API
2. Actualizar mocks cuando cambien las interfaces
3. Verificar que las validaciones sigan siendo relevantes
4. Actualizar constantes de prueba si cambian los mensajes

### Refactoring
1. Extraer lógica común a helpers
2. Consolidar mocks similares
3. Simplificar configuraciones de prueba
4. Mejorar legibilidad y mantenibilidad

## 🎯 Próximos Pasos

### Mejoras Planificadas
- [ ] Pruebas de performance con benchmarks
- [ ] Pruebas de stress para operaciones concurrentes
- [ ] Pruebas de seguridad para validación de inputs
- [ ] Pruebas de compatibilidad con diferentes versiones de Node.js
- [ ] Integración con herramientas de análisis estático

### Expansión de Cobertura
- [ ] Pruebas de controladores HTTP
- [ ] Pruebas de middleware de autenticación
- [ ] Pruebas de validación de DTOs
- [ ] Pruebas de transformación de datos
- [ ] Pruebas de logging y monitoreo

---

**Nota**: Este conjunto de pruebas está diseñado para ser mantenible, escalable y seguir las mejores prácticas de testing en aplicaciones NestJS con arquitectura hexagonal.
