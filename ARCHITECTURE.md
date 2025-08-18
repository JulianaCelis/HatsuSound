# 🏗️ Arquitectura Hexagonal con Railway Oriented Programming

## 🎯 **Descripción General**

HatsuSound implementa **Arquitectura Hexagonal (Puertos y Adaptadores)** combinada con **Railway Oriented Programming (ROP)** para crear un sistema robusto, mantenible y escalable.

## 🚂 **Railway Oriented Programming (ROP)**

### **Concepto Principal:**
ROP maneja el flujo de datos como un "ferrocarril" con dos vías:
- **Success Track** ✅ - Flujo exitoso de datos
- **Failure Track** ❌ - Manejo estructurado de errores

### **Implementación:**
```typescript
export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly _tag = 'Success';
  constructor(readonly value: T) {}
  
  isSuccess(): this is Success<T> { return true; }
  isFailure(): this is Failure<never> { return false; }
}

export class Failure<E> {
  readonly _tag = 'Failure';
  constructor(readonly error: E) {}
  
  isSuccess(): this is Success<never> { return false; }
  isFailure(): this is Failure<E> { return true; }
}
```

### **Uso en Use Cases:**
```typescript
async register(request: RegisterRequest): Promise<Result<RegisterResponse, AuthError>> {
  try {
    // Success Track
    const validationResult = this.validateRequest(request);
    if (validationResult.isFailure()) {
      return validationResult; // Cambia a Failure Track
    }
    
    // Continúa en Success Track
    const user = await this.createUser(request);
    return Success(user);
    
  } catch (error) {
    // Failure Track
    return Failure({
      type: 'VALIDATION_ERROR',
      message: error.message
    });
  }
}
```

## 🏛️ **Arquitectura Hexagonal**

### **Estructura de Capas:**

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL WORLD                          │
│  (HTTP Controllers, Database, External APIs, etc.)        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  INFRASTRUCTURE                             │
│  (Adaptadores que implementan los puertos)                 │
│  - Controllers                                             │
│  - Repositories                                            │
│  - Services                                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   PORTS                                     │
│  (Contratos entre capas)                                   │
│  - Input Ports (Use Cases)                                 │
│  - Output Ports (Repositories, Services)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   DOMAIN                                    │
│  (Entidades, Lógica de Negocio, Reglas)                   │
│  - Entities                                                │
│  - Value Objects                                           │
│  - Domain Services                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 APPLICATION                                 │
│  (Casos de Uso, Orquestación)                             │
│  - Use Cases                                               │
│  - Application Services                                    │
└─────────────────────────────────────────────────────────────┘
```

### **Puertos de Entrada (Input Ports):**
```typescript
// src/domain/ports/input/auth.port.ts
export interface IAuthInputPort {
  register(request: RegisterRequest): Promise<Result<RegisterResponse, AuthError>>;
  login(request: LoginRequest): Promise<Result<LoginResponse, AuthError>>;
  refresh(refreshToken: string): Promise<Result<RefreshResponse, AuthError>>;
  // ... otros métodos
}
```

### **Puertos de Salida (Output Ports):**
```typescript
// src/domain/ports/output/user.repository.port.ts
export interface IUserRepositoryPort {
  save(user: User): Promise<Result<User, RepositoryError>>;
  findById(id: string): Promise<Result<User, RepositoryError>>;
  // ... otros métodos
}
```

## 📁 **Estructura de Directorios**

```
src/
├── domain/                          # Capa de dominio
│   ├── entities/                    # Entidades de dominio
│   ├── ports/                       # Puertos (contratos)
│   │   ├── input/                   # Puertos de entrada
│   │   └── output/                  # Puertos de salida
│   └── services/                    # Servicios de dominio
├── application/                     # Capa de aplicación
│   └── use-cases/                   # Casos de uso
└── infrastructure/                  # Capa de infraestructura
    ├── controllers/                 # Adaptadores de entrada
    ├── repositories/                # Adaptadores de salida
    ├── services/                    # Adaptadores de servicios
    └── database/                    # Implementación de BD
```

## 🔄 **Flujo de Datos**

### **1. Request HTTP → Controller:**
```typescript
@Post('register')
async register(@Body() request: RegisterDto) {
  return await this.authUseCase.register(request);
}
```

### **2. Controller → Use Case (Input Port):**
```typescript
async register(request: RegisterRequest): Promise<Result<RegisterResponse, AuthError>> {
  // Lógica de negocio con ROP
}
```

### **3. Use Case → Domain Service (Output Port):**
```typescript
const userResult = await this.userService.createUser(request);
if (userResult.isFailure()) {
  return userResult; // Railway switch to failure track
}
```

### **4. Domain Service → Repository (Output Port):**
```typescript
const saveResult = await this.userRepository.save(user);
if (saveResult.isFailure()) {
  return saveResult; // Railway switch to failure track
}
```

## 🎨 **Patrones Implementados**

### **1. Repository Pattern:**
- **Interface en dominio**: `IUserRepositoryPort`
- **Implementación en infraestructura**: `UserRepository`
- **Mapeo entre entidades**: Domain ↔ Infrastructure

### **2. Use Case Pattern:**
- **Lógica de negocio centralizada**
- **Orquestación de servicios**
- **Manejo de errores con ROP**

### **3. Dependency Injection:**
- **Tokens de inyección**: `USER_SERVICE`, `USER_REPOSITORY`
- **Interfaces como contratos**
- **Testabilidad mejorada**

### **4. Error Handling:**
- **Tipos de error específicos del dominio**
- **Manejo estructurado con ROP**
- **Traducción a HTTP status codes**

## 🧪 **Testing Strategy**

### **Unit Tests:**
- **Use Cases**: Lógica de negocio aislada
- **Domain Services**: Reglas de negocio
- **Entities**: Validaciones y comportamiento

### **Integration Tests:**
- **Repository**: Persistencia de datos
- **Service**: Integración entre capas
- **Controller**: End-to-end HTTP

### **Test Doubles:**
- **Mocks**: Para puertos de salida
- **Stubs**: Para datos de prueba
- **Fakes**: Para implementaciones simples

## 🚀 **Ventajas de esta Arquitectura**

### **1. Mantenibilidad:**
- **Separación clara de responsabilidades**
- **Código organizado por capas**
- **Fácil localización de cambios**

### **2. Testabilidad:**
- **Dependencias inyectadas**
- **Interfaces como contratos**
- **Aislamiento de lógica de negocio**

### **3. Escalabilidad:**
- **Nuevas funcionalidades sin afectar existentes**
- **Cambios de infraestructura transparentes**
- **Módulos independientes**

### **4. Robustez:**
- **Manejo de errores estructurado**
- **Validaciones en cada capa**
- **Railway Oriented Programming**

## 🔧 **Próximos Pasos**

### **Implementación Completa:**
1. **Refactorizar todos los use cases** para usar ROP
2. **Implementar adaptadores** para todos los puertos
3. **Crear mappers** entre entidades de dominio e infraestructura
4. **Implementar error handling** consistente

### **Mejoras de Arquitectura:**
1. **Event sourcing** para auditoría
2. **CQRS** para separación de lecturas/escrituras
3. **Saga pattern** para transacciones distribuidas
4. **Circuit breaker** para resiliencia

---

## 📚 **Referencias**

- [Arquitectura Hexagonal - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Railway Oriented Programming - Scott Wlaschin](https://fsharpforfunandprofit.com/rop/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/)


