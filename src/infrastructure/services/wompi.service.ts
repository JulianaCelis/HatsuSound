import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  WompiServicePort,
  WompiCreateTransactionRequest,
  WompiTransactionResponse,
} from '../../domain/ports/output/wompi.service.port';
import * as crypto from 'crypto';

type EnvName = 'uat' | 'uat_sandbox' | 'sandbox' | 'production';

@Injectable()
export class WompiService implements WompiServicePort, OnModuleInit {
  private readonly logger = new Logger(WompiService.name);
  private readonly http: AxiosInstance;

  private readonly env: EnvName;
  private readonly baseUrl: string;
  private readonly frontendUrl: string;

  private readonly pubKey: string;     // pub_stagtest_...
  private readonly prvKey: string;     // prv_stagtest_...
  private readonly eventsKey: string;  // stagtest_events_...
  private readonly integKey: string;   // stagtest_integrity_...

  // Alias de entorno para compatibilidad
  private readonly ENV_ALIASES: Record<string, EnvName> = {
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

  constructor(private readonly cfg: ConfigService) {
    this.env = this.resolveEnvName(this.cfg.get<string>('WOMPI_ENVIRONMENT', 'uat_sandbox'));
    
    // URLs por entorno (sin trailing slash)
    const BASE_URLS: Record<EnvName, string> = {
      uat: (this.cfg.get<string>('WOMPI_UAT_URL') || 'https://api.co.uat.wompi.dev/v1').replace(/\/+$/, ''),
      uat_sandbox: (this.cfg.get<string>('WOMPI_UAT_SANDBOX_URL') || 'https://api-sandbox.co.uat.wompi.dev/v1').replace(/\/+$/, ''),
      sandbox: (this.cfg.get<string>('WOMPI_SANDBOX_URL') || 'https://sandbox.wompi.co/v1').replace(/\/+$/, ''),
      production: (this.cfg.get<string>('WOMPI_PRODUCTION_URL') || 'https://api.wompi.co/v1').replace(/\/+$/, ''),
    };

    this.baseUrl = this.cfg.get<string>('WOMPI_BASE_URL') || BASE_URLS[this.env];
    this.frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3000');

    this.pubKey = this.cfg.get<string>('WOMPI_PUBLIC_KEY', '');
    this.prvKey = this.cfg.get<string>('WOMPI_PRIVATE_KEY', '');
    this.eventsKey = this.cfg.get<string>('WOMPI_EVENTS_KEY', '');
    this.integKey = this.cfg.get<string>('WOMPI_INTEGRITY_KEY', '');

    this.logConfiguration();

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000, // Aumentado a 30 segundos
    });

    this.setupInterceptors();
  }

  private resolveEnvName(raw?: string): EnvName {
    const v = (raw ?? '').trim().toLowerCase();
    return this.ENV_ALIASES[v] ?? 'uat_sandbox';
  }

  private logConfiguration(): void {
    const mask = (k?: string) => (k ? `${k.slice(0, 14)}…${k.slice(-4)}` : 'UNDEFINED');
    
    console.log('🔧 WOMPI CONFIGURATION --------------------------------');
    console.log('Environment  :', this.env);
    console.log('Base URL     :', this.baseUrl);
    console.log('Public Key   :', mask(this.pubKey));
    console.log('Private Key  :', mask(this.prvKey));
    console.log('Events Key   :', mask(this.eventsKey));
    console.log('Integrity    :', mask(this.integKey));
    console.log('Frontend URL :', this.frontendUrl);
    console.log('------------------------------------------------');
  }

  private setupInterceptors(): void {
    this.http.interceptors.request.use((config) => {
      const auth = (config.headers?.Authorization as string) ?? '';
      const masked = auth ? `${auth.slice(0, 22)}…` : 'NONE';
      this.logger.log(
        `HTTP ${String(config.method).toUpperCase()} ${config.baseURL}${config.url} [Auth:${masked}]`,
      );
      return config;
    });

    this.http.interceptors.response.use(
      (res) => {
        this.logger.log(`HTTP ${res.status} ${res.config.url}`);
        return res;
      },
      (err) => {
        const st = err.response?.status;
        const t = err.response?.data?.error?.type;
        const r = err.response?.data?.error?.reason;
        this.logger.error(
          `HTTP ${st ?? 'ERR'} ${err.config?.url} :: ${t ?? err.message}${r ? ' - ' + r : ''}`,
        );
        return Promise.reject(err);
      },
    );
  }

  async onModuleInit() {
    try {
      await this.validateMerchantConfiguration();
      const token = await this.getAcceptanceToken();
      this.logger.log(`✅ Acceptance token OK (${token.slice(0, 12)}…)`);
    } catch (e: any) {
      this.logger.error(`❌ No se pudo obtener acceptance_token al iniciar: ${e.message}`);
      // No lanzar error para permitir que la aplicación inicie
      // La funcionalidad de pagos fallará gracefulmente
    }
  }

  // ---------- Helpers ----------

  private async validateMerchantConfiguration(): Promise<void> {
    try {
      const { data } = await this.http.get(`/merchants/${this.pubKey}`);
      this.logger.log(`✅ Merchant configuration valid: ${data?.data?.name || 'Unknown'}`);
    } catch (error: any) {
      if (error.response?.status === 422) {
        this.logger.warn(`⚠️ Public key '${this.pubKey.slice(0, 20)}...' no es un merchant ID válido`);
        this.logger.warn('Verifica que WOMPI_PUBLIC_KEY sea el merchant ID correcto, no la public key de integración');
      } else {
        this.logger.warn(`⚠️ Error validando merchant: ${error.message}`);
      }
    }
  }

  private headers(usePrivate: boolean): AxiosRequestConfig['headers'] {
    const key = usePrivate ? this.prvKey : this.pubKey;
    if (!key) throw new Error(`Falta ${usePrivate ? 'PRIVATE' : 'PUBLIC'} KEY en .env`);
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
  }

  private async getAcceptanceToken(): Promise<string> {
    try {
      // Intentar el endpoint estándar de merchants primero
      const { data } = await this.http.get(`/merchants/${this.pubKey}`);
      const token: string | undefined = data?.data?.presigned_acceptance?.acceptance_token;
      if (!token) throw new Error('Wompi no devolvió presigned_acceptance.acceptance_token');
      return token;
    } catch (error: any) {
      // Si obtenemos un error 422, la public key podría no ser el merchant ID
      if (error.response?.status === 422) {
        this.logger.warn('Public key no es un merchant ID válido, intentando endpoint alternativo...');
        
        try {
          // Intentar el endpoint de acceptance directamente
          const { data } = await this.http.get('/acceptance');
          const token: string | undefined = data?.data?.presigned_acceptance?.acceptance_token;
          if (!token) throw new Error('Wompi no devolvió presigned_acceptance.acceptance_token');
          return token;
        } catch (fallbackError: any) {
          this.logger.error(`❌ Error en endpoint alternativo: ${fallbackError.message}`);
          this.logger.error(`Error técnico de Wompi: ${error.response?.data?.error?.reason || error.message}`);
          throw new Error('No se pudo conectar con el servicio de pagos. Por favor, verifica la configuración.');
        }
      }
      
      // Para otros errores, loggear los detalles técnicos pero lanzar mensajes user-friendly
      this.logger.error(`❌ Error técnico obteniendo acceptance_token: ${error.response?.data?.error?.reason || error.message}`);
      
      if (error.response?.status === 401) {
        throw new Error('Error de autenticación con el servicio de pagos. Verifica las credenciales.');
      } else if (error.response?.status === 403) {
        throw new Error('Acceso denegado al servicio de pagos. Verifica los permisos.');
      } else if (error.response?.status >= 500) {
        throw new Error('El servicio de pagos no está disponible en este momento. Intenta más tarde.');
      } else {
        throw new Error('Error de conexión con el servicio de pagos. Verifica la configuración.');
      }
    }
  }

  private ensureRedirectUrl(body: any): void {
    if (!body.redirect_url) {
      body.redirect_url = `${this.frontendUrl}/payment/result`;
      this.logger.log(`🔗 redirect_url no estaba presente: usando ${body.redirect_url}`);
    }
  }

  private async swapClusterIfNeeded(url: string): Promise<string> {
    if (url.includes('.co.uat.')) return url.replace('.co.uat.', '.uat.');
    if (url.includes('.uat.') && !url.includes('.co.uat.')) return url.replace('.uat.', '.co.uat.');
    return url;
  }

  // ---------- API ----------

  async createTransaction(req: WompiCreateTransactionRequest): Promise<WompiTransactionResponse> {
    const isOneShot = !!(req as any)?.payment_method && !(req as any)?.payment_source_id;
    const usePrivate = !isOneShot;

    if (isOneShot) {
      if (!(req as any).amount_in_cents || typeof (req as any).amount_in_cents !== 'number') {
        throw new Error('amount_in_cents inválido o ausente');
      }
      this.ensureRedirectUrl(req);

      const provided = (req as any)?.acceptance_token;
      if (!provided || provided === 'TOKEN_ACEPTACION') {
        const token = await this.getAcceptanceToken();
        (req as any).acceptance_token = token;
      }
    }

    try {
      const { data } = await this.http.post('/transactions', req, {
        headers: this.headers(usePrivate),
      });
      this.logger.log(`✅ Transaction created: ${data?.data?.id ?? '(sin id)'}`);
      return data;
    } catch (err: any) {
      this.logger.error('❌ === WOMPI TRANSACTION ERROR ===');
      this.logger.error('Status  :', err.response?.status);
      this.logger.error('Type    :', err.response?.data?.error?.type);
      this.logger.error('Reason  :', err.response?.data?.error?.reason);
      this.logger.error('Fields  :', err.response?.data?.error?.messages ?? err.response?.data);
      this.logger.error('===============================');

      // Intentar cluster alternativo si es un error de red o 404
      const isNetworkErr = !err?.response && (
        /ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT/i.test(err?.message || '')
      );

      if (err.response?.status === 404 || isNetworkErr) {
        const altUrl = await this.swapClusterIfNeeded(this.baseUrl);
        if (altUrl !== this.baseUrl) {
          this.logger.warn(`⚠️ ${err.response?.status ?? 'NETWORK'} en ${this.baseUrl}. Reintentando en cluster alterno: ${altUrl}`);
          try {
            const altHttp = axios.create({
              baseURL: altUrl,
              headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
              timeout: 30000,
            });
            
            const { data } = await altHttp.post('/transactions', req, {
              headers: this.headers(usePrivate),
            });
            
            this.logger.log(`✅ Transaction created (cluster alterno): ${data?.data?.id ?? '(sin id)'}`);
            this.logger.warn(`🔁 Sugerencia: fija WOMPI_BASE_URL=${altUrl} en tu .env`);
            return data;
          } catch (e2: any) {
            this.logger.error(`❌ También falló en cluster alterno: ${e2.response?.status ?? 'NETWORK'}`);
          }
        }
      }

      throw new Error(
        `Wompi ${err.response?.status ?? ''} ${err.response?.data?.error?.type ?? ''}: ${
          err.response?.data?.error?.reason ?? err.message
        }`,
      );
    }
  }

  async getTransaction(transactionId: string): Promise<WompiTransactionResponse> {
    try {
      const { data } = await this.http.get(`/transactions/${transactionId}`);
      return data;
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo transacción ${transactionId}: ${error.message}`);
      throw new Error(`No se pudo obtener la transacción: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  async createPaymentLink(request: any): Promise<any> {
    try {
      const { data } = await this.http.post('/payment_links', request, {
        headers: this.headers(true), // PRIVATE
      });
      this.logger.log(`✅ Payment link created: ${data?.data?.id ?? '(sin id)'}`);
      return data;
    } catch (error: any) {
      this.logger.error(`❌ Error creando payment link: ${error.message}`);
      throw new Error(`No se pudo crear el payment link: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  async verifySignature(payload: string, signature: string): Promise<boolean> {
    try {
      if (!this.integKey) {
        this.logger.warn('⚠️ No hay integrity key configurada, saltando verificación de firma');
        return true; // Permitir continuar sin verificación
      }

      const expected = crypto.createHmac('sha256', this.integKey).update(payload).digest('hex');
      const ok =
        signature?.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
      
      this.logger.log(`🔐 Signature verification: ${ok ? 'valid' : 'invalid'}`);
      return ok;
    } catch (e: any) {
      this.logger.error(`❌ Error verificando firma: ${e.message}`);
      return false;
    }
  }

  getCheckoutUrl(transactionId: string): string {
    const base = 'https://checkout.wompi.co';
    return `${base}/p/${this.pubKey}?transaction_id=${transactionId}`;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }

  // Debug y métodos de configuración
  async getMerchantInfo(): Promise<any> {
    try {
      const { data } = await this.http.get(`/merchants/${this.pubKey}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error(`Public key '${this.pubKey.slice(0, 20)}...' no es un merchant ID válido. Verifica la configuración de WOMPI_PUBLIC_KEY.`);
      }
      throw new Error(`Error obteniendo información del merchant: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  async getConfigurationInfo(): Promise<any> {
    return {
      environment: this.env,
      baseUrl: this.baseUrl,
      publicKey: this.pubKey ? `${this.pubKey.slice(0, 14)}…${this.pubKey.slice(-4)}` : 'UNDEFINED',
      privateKey: this.prvKey ? `${this.prvKey.slice(0, 14)}…${this.prvKey.slice(-4)}` : 'UNDEFINED',
      eventsKey: this.eventsKey ? `${this.eventsKey.slice(0, 14)}…${this.eventsKey.slice(-4)}` : 'UNDEFINED',
      integrityKey: this.integKey ? `${this.integKey.slice(0, 14)}…${this.integKey.slice(-4)}` : 'UNDEFINED',
      frontendUrl: this.frontendUrl,
      timestamp: new Date().toISOString(),
    };
  }

  async createPaymentMethodToken(cardData: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolderName: string;
  }): Promise<string> {
    try {
      this.logger.log('💳 Creando token de método de pago en Wompi...');

      const request = {
        number: cardData.number,
        cvc: cardData.cvc,
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        card_holder: cardData.cardHolderName,
      };

      const response = await this.http.post('/tokens/cards', request, {
        headers: { Authorization: `Bearer ${this.pubKey}` },
      });

      if (response.data?.data?.id) {
        const token = response.data.data.id;
        this.logger.log(`✅ Token de método de pago creado: ${token.slice(0, 12)}…`);
        return token;
      } else {
        throw new Error('Wompi no devolvió ID del token');
      }
    } catch (error: any) {
      this.logger.error(`❌ Error creando token de método de pago: ${error.message}`);
      
      if (error.response?.data?.error) {
        const wompiError = error.response.data.error;
        throw new Error(`Wompi ${wompiError.status} ${wompiError.type}: ${wompiError.reason || wompiError.messages?.join(', ')}`);
      }
      
      throw new Error(`Error creando token: ${error.message}`);
    }
  }

  // Método para validar la configuración completa
  async validateConfiguration(): Promise<boolean> {
    try {
      await this.validateMerchantConfiguration();
      await this.getAcceptanceToken();
      return true;
    } catch (error) {
      this.logger.error('❌ Configuración de Wompi inválida:', error.message);
      return false;
    }
  }
}
