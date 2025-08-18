// Puertos de entrada (Input Ports)
export * from './input/auth.port';
export * from './input/audio-product.port';

// Puertos de salida (Output Ports)
export * from './output/user.repository.port';
export * from './output/user.service.port';
export * from './output/auth.service.port';
export * from './output/audio-product.repository.port';

// Tipos comunes - Exportar como valores para poder usarlos como constructores
export { Success, Failure } from './input/auth.port';
export type { Result } from './input/auth.port';

