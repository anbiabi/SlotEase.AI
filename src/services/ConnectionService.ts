import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { ConnectionProtocol, ConnectionLog, AIServiceRequest } from '../types/location';

export class ConnectionService {
  private static instance: ConnectionService;
  private connections: Map<string, AxiosInstance> = new Map();
  private protocols: Map<string, ConnectionProtocol> = new Map();
  private logs: ConnectionLog[] = [];
  private rateLimiters: Map<string, { requests: number; resetTime: number }> = new Map();

  private constructor() {}

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  /**
   * Register a service connection protocol
   */
  public registerService(protocol: ConnectionProtocol): void {
    this.protocols.set(protocol.serviceId, protocol);
    this.createConnection(protocol);
  }

  /**
   * Create secure connection for a service
   */
  private createConnection(protocol: ConnectionProtocol): void {
    const config: AxiosRequestConfig = {
      baseURL: protocol.endpoint,
      timeout: protocol.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SlotEase/1.0.0',
        'X-API-Version': '1.0'
      }
    };

    // Configure authentication
    switch (protocol.authMethod) {
      case 'oauth2':
        if (protocol.credentials.token) {
          config.headers!['Authorization'] = `Bearer ${protocol.credentials.token}`;
        }
        break;
      case 'api_key':
        if (protocol.credentials.apiKey) {
          config.headers!['X-API-Key'] = protocol.credentials.apiKey;
        }
        break;
      case 'jwt':
        if (protocol.credentials.token) {
          config.headers!['Authorization'] = `Bearer ${protocol.credentials.token}`;
        }
        break;
      case 'basic':
        if (protocol.credentials.clientId && protocol.credentials.clientSecret) {
          const credentials = btoa(`${protocol.credentials.clientId}:${protocol.credentials.clientSecret}`);
          config.headers!['Authorization'] = `Basic ${credentials}`;
        }
        break;
    }

    const instance = axios.create(config);

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        // Check rate limiting
        if (!this.checkRateLimit(protocol.serviceId, protocol.rateLimit)) {
          throw new Error('Rate limit exceeded');
        }

        // Log request
        this.logConnection({
          id: this.generateLogId(),
          serviceId: protocol.serviceId,
          timestamp: new Date(),
          type: 'request',
          method: config.method?.toUpperCase() || 'GET',
          endpoint: config.url || '',
          responseTime: 0,
          requestData: config.data
        });

        return config;
      },
      (error) => {
        this.logConnection({
          id: this.generateLogId(),
          serviceId: protocol.serviceId,
          timestamp: new Date(),
          type: 'error',
          method: 'UNKNOWN',
          endpoint: '',
          responseTime: 0,
          errorMessage: error.message
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response
        this.logConnection({
          id: this.generateLogId(),
          serviceId: protocol.serviceId,
          timestamp: new Date(),
          type: 'response',
          method: response.config.method?.toUpperCase() || 'GET',
          endpoint: response.config.url || '',
          statusCode: response.status,
          responseTime: this.calculateResponseTime(response),
          responseData: response.data
        });

        // Update connection state
        this.updateConnectionState(protocol.serviceId, 'connected');
        return response;
      },
      (error) => {
        // Log error response
        this.logConnection({
          id: this.generateLogId(),
          serviceId: protocol.serviceId,
          timestamp: new Date(),
          type: 'error',
          method: error.config?.method?.toUpperCase() || 'UNKNOWN',
          endpoint: error.config?.url || '',
          statusCode: error.response?.status,
          responseTime: 0,
          errorMessage: error.message,
          responseData: error.response?.data
        });

        // Update connection state
        this.updateConnectionState(protocol.serviceId, 'error');
        
        // Implement retry logic
        return this.handleRetry(protocol, error);
      }
    );

    this.connections.set(protocol.serviceId, instance);
    this.updateConnectionState(protocol.serviceId, 'connected');
  }

  /**
   * Make authenticated request to service
   */
  public async makeRequest<T = any>(
    serviceId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const connection = this.connections.get(serviceId);
    const protocol = this.protocols.get(serviceId);

    if (!connection || !protocol) {
      throw new Error(`Service ${serviceId} not registered`);
    }

    try {
      const response = await connection.request({
        url: endpoint,
        method,
        data
      });

      return response.data;
    } catch (error) {
      console.error(`Request failed for service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * OAuth 2.0 authentication flow
   */
  public async authenticateOAuth2(
    serviceId: string,
    clientId: string,
    clientSecret: string,
    scope?: string
  ): Promise<string> {
    try {
      const protocol = this.protocols.get(serviceId);
      if (!protocol) {
        throw new Error(`Service ${serviceId} not found`);
      }

      const tokenEndpoint = `${protocol.endpoint}/oauth/token`;
      const response = await axios.post(tokenEndpoint, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope || 'read write'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const accessToken = response.data.access_token;
      
      // Update protocol with new token
      protocol.credentials.token = accessToken;
      this.protocols.set(serviceId, protocol);
      
      // Recreate connection with new token
      this.createConnection(protocol);

      return accessToken;
    } catch (error) {
      console.error(`OAuth2 authentication failed for ${serviceId}:`, error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Check service availability
   */
  public async checkServiceHealth(serviceId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(serviceId, '/health', 'GET');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get real-time availability
   */
  public async getAvailability(serviceId: string): Promise<any> {
    return this.makeRequest(serviceId, '/availability', 'GET');
  }

  /**
   * Submit booking request
   */
  public async submitBooking(serviceId: string, bookingData: any): Promise<any> {
    return this.makeRequest(serviceId, '/bookings', 'POST', bookingData);
  }

  /**
   * Cancel booking
   */
  public async cancelBooking(serviceId: string, bookingId: string): Promise<any> {
    return this.makeRequest(serviceId, `/bookings/${bookingId}`, 'DELETE');
  }

  /**
   * Get connection logs
   */
  public getConnectionLogs(serviceId?: string): ConnectionLog[] {
    if (serviceId) {
      return this.logs.filter(log => log.serviceId === serviceId);
    }
    return this.logs;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(serviceId: string): ConnectionProtocol | undefined {
    return this.protocols.get(serviceId);
  }

  /**
   * Encrypt sensitive data
   */
  public encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Decrypt sensitive data
   */
  public decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private checkRateLimit(serviceId: string, rateLimit: ConnectionProtocol['rateLimit']): boolean {
    const now = Date.now();
    const limiter = this.rateLimiters.get(serviceId);

    if (!limiter || now > limiter.resetTime) {
      // Reset rate limiter
      this.rateLimiters.set(serviceId, {
        requests: 1,
        resetTime: now + (rateLimit.window * 1000)
      });
      return true;
    }

    if (limiter.requests >= rateLimit.requests) {
      return false; // Rate limit exceeded
    }

    limiter.requests++;
    return true;
  }

  private async handleRetry(protocol: ConnectionProtocol, error: any): Promise<any> {
    const currentErrorCount = protocol.errorCount || 0;
    
    if (currentErrorCount < protocol.retryAttempts) {
      protocol.errorCount = currentErrorCount + 1;
      this.protocols.set(protocol.serviceId, protocol);
      
      // Exponential backoff
      const delay = Math.pow(2, currentErrorCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return this.makeRequest(protocol.serviceId, error.config.url, error.config.method, error.config.data);
    }
    
    throw error;
  }

  private updateConnectionState(serviceId: string, state: ConnectionProtocol['connectionState']): void {
    const protocol = this.protocols.get(serviceId);
    if (protocol) {
      protocol.connectionState = state;
      protocol.lastConnection = new Date();
      if (state === 'connected') {
        protocol.errorCount = 0;
      }
      this.protocols.set(serviceId, protocol);
    }
  }

  private logConnection(log: ConnectionLog): void {
    this.logs.push(log);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateResponseTime(response: AxiosResponse): number {
    // This would typically be calculated using request start time
    // For now, we'll use a placeholder
    return Date.now() - (response.config as any).requestStartTime || 0;
  }
}