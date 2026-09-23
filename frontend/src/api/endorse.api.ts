import { apiClient, ApiResponse } from './client';

export interface EndorsePayload {
  policyNumber: string;
  idEnvio?: number;
  frecuencia: string;
  tipoEndoso: string;
  producto: string;
  plan: string;
  moneda: string;
  usuario: string;
  fechaSolicitud?: string;
  fechaCliente?: string;
  fechaEfectiva?: string;
  [key: string]: any;
}

export interface DynamicDataItem {
  etiqueta: string;
  value: string;
}

export interface EventAppliedItem {
  description: string;
  orderEvent: number;
}

export interface CoreResponse {
  policyNumber: string;
  idEnvio?: number;
  financialPlansEntity: { description: string };
  currency: { description: string };
  productEntity: { description: string };
  eventEntity: {
    description: string;
    dynamicData: DynamicDataItem[];
  };
  eventAppliedEntities: EventAppliedItem[];
  riskUnitEntities: any[];
  participationEntities: any[];
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    username: string;
    role: string;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
}

export const endorseApi = {
  checkHealth: (): Promise<ApiResponse<HealthResponse>> => {
    return apiClient<HealthResponse>('/health');
  },

  getToken: (username = 'interface.servicios', role = 'service'): Promise<ApiResponse<TokenResponse>> => {
    return apiClient<TokenResponse>('/v1/auth/token', {
      method: 'POST',
      body: JSON.stringify({ username, role }),
    });
  },

  translate: (payload: EndorsePayload, token: string): Promise<ApiResponse<CoreResponse>> => {
    return apiClient<CoreResponse>(
      '/v1/endorse/translate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  },
};
