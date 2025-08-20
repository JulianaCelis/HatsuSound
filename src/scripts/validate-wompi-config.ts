#!/usr/bin/env ts-node
import 'dotenv/config';
import axios from 'axios';
import { URL } from 'url';

type EnvName = 'uat' | 'uat_sandbox' | 'sandbox' | 'production';

// Alias de entorno
const ENV_ALIASES: Record<string, EnvName> = {
  staging: 'uat_sandbox',
  'uat-sandbox': 'uat_sandbox',
  uat: 'uat',
  uat_sandbox: 'uat_sandbox',
  sbx: 'sandbox',
  dev: 'sandbox',
  sandbox: 'sandbox',
  prod: 'production',
  production: 'production',
};

function resolveEnvName(raw?: string): EnvName {
  const v = (raw ?? '').trim().toLowerCase();
  return ENV_ALIASES[v] ?? 'uat_sandbox';
}

const ENV = resolveEnvName(process.env.WOMPI_ENVIRONMENT);

// URLs por entorno (sin trailing slash)
const BASE_URLS: Record<EnvName, string> = {
  uat: (process.env.WOMPI_UAT_URL || 'https://api.co.uat.wompi.dev/v1').replace(/\/+$/, ''),
  uat_sandbox: (process.env.WOMPI_UAT_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1').replace(/\/+$/, ''),
  sandbox: (process.env.WOMPI_SANDBOX_URL || 'https://sandbox.wompi.co/v1').replace(/\/+$/, ''),
  production: (process.env.WOMPI_PRODUCTION_URL || 'https://api.wompi.co/v1').replace(/\/+$/, ''),
};

function normalizeUrl(u?: string): string {
  return (u ?? '').trim().replace(/\/+$/, '');
}
function mask(s: string): string {
  return s ? `${s.slice(0, 20)}...${s.slice(-4)}` : 'NO CONFIGURADO';
}
function ensureUrlOrExit(u: string, label: string) {
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) throw new Error('Protocolo inválido');
  } catch {
    console.error(`❌ ${label} no es una URL válida: ${u || '(vacía)'}`);
    process.exit(1);
  }
}
function warnIfMismatchedEnv(appEnv?: string, wompiEnv?: string) {
  const a = (appEnv ?? '').trim().toLowerCase();
  const w = (wompiEnv ?? '').trim().toLowerCase();
  if (a && w && a !== w) console.warn(`⚠️ PAYMENT_ENVIRONMENT=${a} y WOMPI_ENVIRONMENT=${w} difieren. Alinea ambos.`);
}
function swapCluster(u: string): string {
  if (u.includes('.co.uat.')) return u.replace('.co.uat.', '.uat.');
  if (u.includes('.uat.') && !u.includes('.co.uat.')) return u.replace('.uat.', '.co.uat.');
  return u;
}
async function getMerchant(baseUrl: string, publicKey: string) {
  return axios.get(`${baseUrl}/merchants/${publicKey}`, {
    timeout: 15000,
    headers: { Accept: 'application/json' },
  });
}

async function main() {
  console.log('🔧 Validando configuración de Wompi...\n');

  const baseUrl = normalizeUrl(process.env.WOMPI_BASE_URL || BASE_URLS[ENV]);
  const publicKey = (process.env.WOMPI_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.WOMPI_PRIVATE_KEY || '').trim();
  const eventsKey = (process.env.WOMPI_EVENTS_KEY || '').trim();
  const integrityKey = (process.env.WOMPI_INTEGRITY_KEY || '').trim();

  console.log('📋 Configuración actual:');
  console.log(`   Environment: ${ENV}`);
  console.log(`   Base URL:    ${baseUrl || '(no resuelta)'}`);
  console.log(`   Public Key:  ${mask(publicKey)}`);
  console.log(`   Private Key: ${mask(privateKey)}`);
  console.log(`   Events Key:  ${eventsKey ? `${eventsKey.slice(0, 16)}…` : 'NO CONFIGURADO'}`);
  console.log(`   Integrity:   ${integrityKey ? `${integrityKey.slice(0, 16)}…` : 'NO CONFIGURADO'}\n`);

  warnIfMismatchedEnv(process.env.PAYMENT_ENVIRONMENT, process.env.WOMPI_ENVIRONMENT);

  if (!publicKey || !privateKey) {
    console.error('❌ Faltan claves WOMPI_PUBLIC_KEY y/o WOMPI_PRIVATE_KEY en .env');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('❌ Falta la URL base para el entorno seleccionado (revisa WOMPI_ENVIRONMENT o WOMPI_BASE_URL)');
    process.exit(1);
  }
  ensureUrlOrExit(baseUrl, 'Base URL');

  console.log('🧪 1) GET /merchants/:public_key para obtener presigned acceptance...\n');
  try {
    const { data } = await getMerchant(baseUrl, publicKey);
    const m = data?.data;
    console.log('   ✅ OK');
    console.log(`      Comercio: ${m?.name ?? '(sin nombre)'}`);
    console.log(`      Email:    ${m?.email ?? '(no reportado)'}`);
    console.log(`      Acceptance token: ${m?.presigned_acceptance?.acceptance_token ? '✅' : '❌'}`);
    console.log(`      Personal data auth: ${m?.presigned_personal_data_auth?.acceptance_token ? '✅' : '❌'}`);
  } catch (e: any) {
    const status = e?.response?.status;
    const reason = e?.response?.data?.error?.reason || e?.message || '';

    // Fallback si: 404 (no existe merchant en ese host) o error de red/DNS (sin response)
    const isNetworkErr = !e?.response && (
      /ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT/i.test(reason)
    );

    if (status === 404 || isNetworkErr) {
      const alt = swapCluster(baseUrl);
      if (alt !== baseUrl) {
        console.warn(`   ⚠️ ${status ?? 'NETWORK'} en ${baseUrl}. Reintentando en cluster alterno: ${alt}`);
        try {
          const { data } = await getMerchant(alt, publicKey);
          const m = data?.data;
          console.log('   ✅ OK (cluster alterno)');
          console.log(`      Comercio: ${m?.name ?? '(sin nombre)'}`);
          console.log(`      Email:    ${m?.email ?? '(no reportado)'}`);
          console.log(`      Acceptance token: ${m?.presigned_acceptance?.acceptance_token ? '✅' : '❌'}`);
          console.log(`      Personal data auth: ${m?.presigned_personal_data_auth?.acceptance_token ? '✅' : '❌'}`);
          console.log(`      🔁 Sugerencia: fija WOMPI_BASE_URL=${alt} en tu .env\n`);
          process.exit(0);
        } catch (e2: any) {
          const st2 = e2?.response?.status;
          const rs2 = e2?.response?.data?.error?.reason || e2?.message;
          console.error(`   ❌ También falló en cluster alterno (${st2 ?? 'NETWORK'}): ${rs2}`);
          process.exit(1);
        }
      }
    }

    console.error(`   ❌ Error ${status ?? 'NETWORK'} en /merchants: ${reason}`);
    console.error('   ⇒ Revisa: URL base y que la PUBLIC KEY pertenezca a ese cluster.\n');
    process.exit(1);
  }

  console.log('\n✅ Configuración Wompi verificada. Usa esos tokens en la creación de transacciones/fuentes.');
}

main().catch((err) => {
  console.error('❌ Error no controlado:', err?.message || err);
  process.exit(1);
});
