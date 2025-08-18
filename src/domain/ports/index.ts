// Puertos de entrada (Input Ports)
export * from './input/auth.port';

// Puertos de salida (Output Ports)
export * from './output/user.repository.port';
export * from './output/user.service.port';
export * from './output/auth.service.port';

// Tipos comunes - Exportar como valores para poder usarlos como constructores
export { Success, Failure } from './input/auth.port';
export type { Result } from './input/auth.port';

