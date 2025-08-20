# 🌱 Seeders de HatsuSound

Este directorio contiene los seeders para poblar la base de datos con datos de prueba.

## 📁 Archivos

- **`audio-products.seed.ts`** - Seeder principal con 25 productos de audio
- **`main.seed.ts`** - Seeder principal que ejecuta todos los seeders
- **`run-seeds.ts`** - Script para ejecutar los seeders desde línea de comandos

## 🎵 Productos Incluidos

### 🎸 Rock Clásico (3)
- **Bohemian Rhapsody** - Queen (1975)
- **Stairway to Heaven** - Led Zeppelin (1971)
- **Hotel California** - Eagles (1976)

### 🎤 Pop Icónico (2)
- **Billie Jean** - Michael Jackson (1983)
- **Like a Prayer** - Madonna (1989)

### 🎷 Jazz Clásico (2)
- **Take Five** - Dave Brubeck Quartet (1959)
- **So What** - Miles Davis (1959)

### 🎹 Clásica (2)
- **Moonlight Sonata - 1st Movement** - Beethoven (1801)
- **Symphony No. 5 - 1st Movement** - Beethoven (1808)

### 🎧 Electrónica (2)
- **Sandstorm** - Darude (1999)
- **Windowlicker** - Aphex Twin (1999)

### 🎤 Hip-Hop (2)
- **Juicy** - The Notorious B.I.G. (1994)
- **Nuthin' But a 'G' Thang** - Dr. Dre ft. Snoop Dogg (1992)

### 🎸 Country (2)
- **Ring of Fire** - Johnny Cash (1963)
- **Jolene** - Dolly Parton (1974)

### 🎸 Blues (2)
- **Hoochie Coochie Man** - Muddy Waters (1954)
- **The Thrill is Gone** - B.B. King (1969)

### 🌟 Reggae (2)
- **No Woman, No Cry** - Bob Marley & The Wailers (1974)
- **Buffalo Soldier** - Bob Marley & The Wailers (1983)

### 🎭 Folk (2)
- **Blowin' in the Wind** - Bob Dylan (1963)
- **The Sound of Silence** - Simon & Garfunkel (1964)

### 🎵 Pop Moderno (2)
- **Shape of You** - Ed Sheeran (2017)
- **Uptown Funk** - Mark Ronson ft. Bruno Mars (2014)

## 🚀 Cómo Ejecutar

### Opción 1: Usando npm script
```bash
npm run db:seed
```

### Opción 2: Ejecutando directamente
```bash
npx ts-node -r tsconfig-paths/register src/infrastructure/database/seeds/run-seeds.ts
```

### Opción 3: Desde el código
```typescript
import { runSeeds } from './seeds/run-seeds';

// En tu aplicación
await runSeeds();
```

## ⚙️ Configuración

Los seeders usan las mismas variables de entorno que tu aplicación:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=hatsusound
```

## 🔄 Características

- **✅ Verificación de duplicados** - No crea productos que ya existen
- **🎯 Datos realistas** - Precios, duraciones y estadísticas realistas
- **🏷️ Tags variados** - Cada producto tiene tags relevantes
- **📅 Fechas históricas** - Fechas de lanzamiento reales
- **🎭 Géneros diversos** - Cubre todos los géneros musicales
- **🌍 Múltiples idiomas** - Incluye productos en diferentes idiomas
- **👥 Diferentes épocas** - Desde 1801 hasta 2017

## 📊 Estadísticas Incluidas

Cada producto incluye:
- Contadores de reproducción realistas
- Contadores de descarga
- Stock disponible
- Precios variados
- Duración en segundos
- Bitrate de calidad

## 🎯 Casos de Uso

- **Desarrollo** - Poblar base de datos local
- **Testing** - Datos de prueba para tests
- **Demo** - Mostrar funcionalidades de la API
- **Frontend** - Desarrollar interfaz con datos reales

## 🚨 Notas Importantes

- Los seeders solo crean productos que no existen
- No modifica productos existentes
- Requiere conexión a base de datos activa
- Ejecuta después de las migraciones
- Los productos se crean como activos por defecto

¡Disfruta de tu base de datos llena de música! 🎵
