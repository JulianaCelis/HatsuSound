# 🔐 Sistema de Seguridad - HatsuSound Backend

## 🎯 **Características Implementadas**

### **1. Autenticación JWT**
- ✅ **Access Tokens**: Generación y validación de JWT
- ✅ **Refresh Tokens**: Sistema completo de renovación de tokens
- ✅ **Token Expiration**: Configuración de expiración automática
- ✅ **Token Revocation**: Capacidad de revocar tokens específicos

### **2. Middleware de Seguridad**
- ✅ **Rate Limiting**: Protección contra ataques de fuerza bruta
- ✅ **CORS**: Configuración segura de Cross-Origin Resource Sharing
- ✅ **Request Logging**: Logging detallado de requests autenticados
- ✅ **IP Tracking**: Seguimiento de IPs para auditoría

### **3. Sistema de Roles y Permisos**
- ✅ **Role-Based Access Control (RBAC)**: Roles USER, MODERATOR, ADMIN
- ✅ **Role Guards**: Protección de endpoints por rol
- ✅ **Permission Decorators**: Decoradores para definir roles requeridos

### **4. Endpoints de Autenticación**
- ✅ **POST /auth/register**: Registro de usuarios
- ✅ **POST /auth/login**: Login con JWT + Refresh Token
- ✅ **POST /auth/refresh**: Renovación de access tokens
- ✅ **POST /auth/logout**: Logout individual
- ✅ **POST /auth/logout-all**: Logout de todas las sesiones
- ✅ **GET /auth/profile**: Perfil del usuario autenticado

### **5. Endpoints Protegidos por Rol**
- ✅ **GET /users/profile**: Perfil del usuario (requiere autenticación)
- ✅ **GET /users/admin-only**: Solo administradores
- ✅ **GET /users/moderator-or-admin**: Moderadores y administradores

### **6. Seguridad de Base de Datos**
- ✅ **UUID Generation**: IDs únicos generados automáticamente
- ✅ **Password Hashing**: Bcrypt con salt rounds
- ✅ **Token Storage**: Almacenamiento seguro de refresh tokens
- ✅ **Cascade Deletion**: Limpieza automática de tokens huérfanos

### **7. Monitoreo y Auditoría**
- ✅ **Authentication Logging**: Log de todos los intentos de autenticación
- ✅ **Error Tracking**: Filtros específicos para errores de auth
- ✅ **Performance Monitoring**: Tiempo de respuesta de requests
- ✅ **Token Cleanup**: Limpieza automática de tokens expirados

## 🚀 **Configuración de Seguridad**

### **Variables de Entorno Requeridas**
```env
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### **Configuración de Rate Limiting**
- **Ventana**: 15 minutos
- **Límite**: 100 requests por ventana
- **Por IP**: Separación por dirección IP
- **Por Endpoint**: Límites específicos para endpoints de auth

### **Configuración de JWT**
- **Algoritmo**: HS256
- **Expiración**: Configurable por variable de entorno
- **Payload**: ID, email, username, role del usuario

## 🛡️ **Protecciones Implementadas**

### **Contra Ataques Comunes**
- ✅ **Brute Force**: Rate limiting en endpoints de auth
- ✅ **Token Hijacking**: Refresh tokens con expiración
- ✅ **Session Fixation**: Tokens únicos por sesión
- ✅ **CSRF**: Headers de seguridad en CORS
- ✅ **SQL Injection**: TypeORM con parámetros preparados

### **Auditoría y Logging**
- ✅ **Access Logs**: Todos los requests autenticados
- ✅ **Error Logs**: Errores de autenticación detallados
- ✅ **Security Events**: Intentos de acceso no autorizado
- ✅ **Performance Metrics**: Tiempo de respuesta por endpoint

## 🔧 **Uso de Decoradores de Roles**

### **Proteger Endpoints por Rol**
```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async adminOnly() {
  // Solo accesible por administradores
}

@Get('moderator-or-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
async moderatorOrAdmin() {
  // Accesible por moderadores y administradores
}
```

### **Verificar Roles en Guards**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

## 📊 **Monitoreo de Seguridad**

### **Métricas Disponibles**
- **Requests por IP**: Seguimiento de actividad por dirección
- **Failed Logins**: Intentos fallidos de autenticación
- **Token Usage**: Uso de access y refresh tokens
- **Role Access**: Acceso a endpoints protegidos por rol

### **Alertas Automáticas**
- **Rate Limit Exceeded**: Cuando se superan los límites
- **Unauthorized Access**: Intentos de acceso sin autenticación
- **Role Violation**: Acceso a endpoints con rol insuficiente

## 🚨 **Respuesta a Incidentes**

### **Procedimientos de Seguridad**
1. **Token Comprometido**: Revocar inmediatamente con `/auth/logout-all`
2. **Ataque Detectado**: Bloquear IP en rate limiting
3. **Usuario Comprometido**: Desactivar cuenta temporalmente
4. **Audit Trail**: Revisar logs de seguridad

### **Herramientas de Respuesta**
- **Token Revocation**: API para revocar tokens específicos
- **Session Management**: Control de sesiones activas
- **Security Logs**: Logs detallados para investigación
- **Real-time Monitoring**: Monitoreo en tiempo real de requests

## 🔒 **Mejores Prácticas Implementadas**

### **Seguridad de Tokens**
- ✅ **Short-lived Access Tokens**: Expiración rápida (24h)
- ✅ **Long-lived Refresh Tokens**: Renovación automática (30 días)
- ✅ **Token Rotation**: Nuevos tokens en cada refresh
- ✅ **Secure Storage**: Almacenamiento en base de datos

### **Validación de Entrada**
- ✅ **Input Sanitization**: Limpieza de datos de entrada
- ✅ **Role Validation**: Validación de roles en requests
- ✅ **Password Strength**: Requisitos mínimos de contraseña
- ✅ **Email Validation**: Validación de formato de email

### **Configuración de Producción**
- ✅ **Environment Variables**: Configuración por entorno
- ✅ **HTTPS Only**: Configuración para producción
- ✅ **Secure Headers**: Headers de seguridad HTTP
- ✅ **Error Masking**: Ocultar detalles internos en producción

---

## 📝 **Notas de Implementación**

Este sistema de seguridad está diseñado siguiendo las mejores prácticas de la industria y proporciona una base sólida para aplicaciones en producción. Todas las características están documentadas en Swagger y pueden ser probadas a través de la interfaz `/api`.

Para reportar problemas de seguridad, contacta al equipo de desarrollo inmediatamente.
