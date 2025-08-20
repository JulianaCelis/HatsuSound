# 🔧 Configuración de Wompi Payment Gateway

## 📋 Requisitos Previos

1. **Cuenta en Wompi**: Debes tener una cuenta activa en [Wompi](https://wompi.co)
2. **Acceso al Dashboard**: Necesitas acceso al dashboard de Wompi para obtener las credenciales
3. **Entorno configurado**: Decide si usarás staging (sandbox) o production

## 🔑 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Wompi Configuration
WOMPI_ENVIRONMENT=staging
WOMPI_UAT_SANDBOX_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_UAT_URL=https://api.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=tu_merchant_id_aqui
WOMPI_PRIVATE_KEY=tu_private_key_aqui
WOMPI_EVENTS_KEY=tu_events_key_aqui
WOMPI_INTEGRITY_KEY=tu_integrity_key_aqui
```

## ⚠️ IMPORTANTE: WOMPI_PUBLIC_KEY vs Public Key de Integración

**ERROR COMÚN**: Muchos desarrolladores confunden el `WOMPI_PUBLIC_KEY` con la "Public Key de integración".

### ❌ INCORRECTO
```env
WOMPI_PUBLIC_KEY=pub_stagtest_1234567890abcdef
```

### ✅ CORRECTO
```env
WOMPI_PUBLIC_KEY=1234567890abcdef123456
```

## 🎯 Cómo Obtener las Credenciales Correctas

### 1. Merchant ID (WOMPI_PUBLIC_KEY)
1. Ve a [https://dashboard.wompi.co](https://dashboard.wompi.co)
2. Inicia sesión en tu cuenta
3. Ve a **Configuración** > **Integración**
4. Copia el **"Merchant ID"** (NO la "Public Key de integración")
5. El Merchant ID tiene 24 caracteres y NO comienza con "pub_"

### 2. Private Key (WOMPI_PRIVATE_KEY)
1. En la misma página de **Configuración** > **Integración**
2. Copia la **"Private Key"**
3. Esta clave comienza con "prv_" y es secreta

### 3. Events Key (WOMPI_EVENTS_KEY)
1. Ve a **Configuración** > **Webhooks**
2. Copia la **"Events Key"**
3. Se usa para verificar la autenticidad de los webhooks

### 4. Integrity Key (WOMPI_INTEGRITY_KEY)
1. En **Configuración** > **Integración**
2. Copia la **"Integrity Key"**
3. Se usa para verificar firmas de transacciones

## 🧪 Validar la Configuración

### Opción 1: Script de Validación
```bash
npm run wompi:validate
```

Este script:
- Verifica que todas las variables estén configuradas
- Prueba la conexión con Wompi
- Valida el formato de las claves
- Proporciona sugerencias de corrección

### Opción 2: Endpoint de Prueba
```bash
# Obtener información del proveedor
GET /payment/provider-info

# Probar conexión con Wompi
GET /payment/test-wompi-connection
```

**Nota**: Estos endpoints requieren autenticación JWT y rol de ADMIN.

## 🔍 Solución de Problemas Comunes

### Error 422: INPUT_VALIDATION_ERROR
**Causa**: `WOMPI_PUBLIC_KEY` no es un Merchant ID válido
**Solución**: 
1. Verifica que estés usando el Merchant ID, no la Public Key de integración
2. El Merchant ID debe tener 24 caracteres
3. NO debe comenzar con "pub_"

### Error: "No se pudo obtener acceptance_token"
**Causa**: Problemas de configuración o conexión
**Solución**:
1. Ejecuta `npm run wompi:validate`
2. Verifica que todas las variables estén configuradas
3. Confirma que el Merchant ID sea correcto
4. Verifica la conectividad a internet

### Error: "Falta PRIVATE KEY en .env"
**Causa**: Variable `WOMPI_PRIVATE_KEY` no configurada
**Solución**: Agrega la Private Key al archivo `.env`

## 📚 Recursos Útiles

- [Documentación Oficial de Wompi](https://docs.wompi.co)
- [Dashboard de Wompi](https://dashboard.wompi.co)
- [Endpoints de Prueba](https://docs.wompi.co/docs/endpoints)
- [Guía de Integración](https://docs.wompi.co/docs/integration-guide)

## 🚀 Próximos Pasos

Una vez que la configuración esté funcionando:

1. **Probar transacciones**: Usa el endpoint `/payment/create`
2. **Configurar webhooks**: Para recibir notificaciones de pagos
3. **Implementar verificación**: Usar la Integrity Key para validar transacciones
4. **Monitorear logs**: Revisar los logs de la aplicación para transacciones

## 📞 Soporte

Si continúas teniendo problemas:

1. Ejecuta `npm run wompi:validate` y comparte la salida
2. Verifica los logs de la aplicación
3. Consulta la documentación oficial de Wompi
4. Contacta al soporte de Wompi si es necesario

