import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { UserResponseSchema } from '../common/schemas/user.schema';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('HatsuSound API')
  .setDescription(`
    ## 🎵 API para HatsuSound con Arquitectura Hexagonal
    
    ### 🔐 Autenticación
    - **Register**: Crear nueva cuenta de usuario
    - **Login**: Iniciar sesión y obtener JWT token
    - **Profile**: Obtener perfil del usuario autenticado
    
    ### 👥 Roles de Usuario
    - **USER**: Usuario básico (por defecto)
    - **MODERATOR**: Moderador con permisos extendidos
    - **ADMIN**: Administrador con todos los permisos
    
    ### 🚀 Características
    - Arquitectura Hexagonal (Ports & Adapters)
    - Validación automática de datos
    - Documentación interactiva con Swagger
    - Autenticación JWT
    - Base de datos PostgreSQL con TypeORM
    
    ### 📚 Documentación
    - Todos los endpoints están documentados
    - Ejemplos de request/response incluidos
    - Códigos de error detallados
    - Esquemas de datos completos
  `)
  .setVersion('1.0.0')
  .setContact('HatsuSound Team', 'https://hatsusound.com', 'dev@hatsusound.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('auth', 'Endpoints de autenticación y autorización')
  .addTag('users', 'Gestión de usuarios y perfiles')
  .addServer(`http://localhost:${process.env.PORT || 3001}`, 'Servidor de desarrollo')
  .addServer('https://api.hatsusound.com', 'Servidor de producción')
  .build();

export const swaggerOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  extraModels: [UserResponseSchema],
};
