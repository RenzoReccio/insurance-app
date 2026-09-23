import { apiClient, ApiResponse, GO_API_BASE_URL } from './client';

export interface RouteRequest {
  depots: string[];
  accidentLocation: string;
  graph?: Record<string, Record<string, number>>;
}

export interface RouteResponse {
  fromDepot: string;
  to: string;
  distance: number;
  path: string[];
}

export interface GoHealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface GoTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const routeApi = {
  checkHealth: (): Promise<ApiResponse<GoHealthResponse>> => {
    return apiClient<GoHealthResponse>('/health', {}, undefined, GO_API_BASE_URL);
  },

  getToken: (username = 'interface.gruas', role = 'dispatcher'): Promise<ApiResponse<GoTokenResponse>> => {
    return apiClient<GoTokenResponse>(
      '/v1/auth/token',
      {
        method: 'POST',
        body: JSON.stringify({ username, role }),
      },
      undefined,
      GO_API_BASE_URL
    );
  },

  calculateOptimalRoute: (
    req: RouteRequest,
    token: string
  ): Promise<ApiResponse<RouteResponse>> => {
    return apiClient<RouteResponse>(
      '/v1/routes/optimal',
      {
        method: 'POST',
        body: JSON.stringify(req),
      },
      token,
      GO_API_BASE_URL
    );
  },
};
