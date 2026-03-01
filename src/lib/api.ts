import axios from 'axios';

const api = axios.create({
  baseURL: '/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface Upstream {
  id: number;
  name: string;
  base_url: string;
  api_key?: string;
  extra_headers?: Record<string, string>;
  timeout_secs: number;
  weight: number;
  priority: number;
  lb_strategy: 'round_robin' | 'weighted' | 'failover';
  enabled: boolean;
  is_healthy: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  id: number;
  token_hash: string;
  label: string;
  expires_at?: string;
  enabled: boolean;
  rpm_limit?: number;
  tpm_limit?: number;
  created_at: string;
  updated_at: string;
}

export interface RouteRule {
  id: number;
  name: string;
  inbound_path: string;
  outbound_path: string;
  match_type: 'exact' | 'prefix' | 'regex';
  upstream_id?: number;
  priority: number;
  extra_headers?: Record<string, string>;
  extra_query?: Record<string, string>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: number;
  token_id?: number;
  upstream_id?: number;
  path: string;
  method: string;
  status_code: number;
  latency_ms: number;
  request_size: number;
  response_size: number;
  created_at: string;
}

export interface HealthRecord {
  id: number;
  upstream_id: number;
  checked_at: string;
  success: boolean;
  latency_ms?: number;
  error_message?: string;
}

export interface DashboardSummary {
  period: string;
  total_requests: number;
  success_requests: number;
  error_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  total_upstreams: number;
  healthy_upstreams: number;
  active_tokens: number;
  requests_per_day: Array<{
    date: string;
    total: number;
    success: number;
  }>;
}

export interface UpstreamStat {
  upstream_id?: number;
  upstream_name?: string;
  total_requests: number;
  success_requests: number;
  error_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  total_request_bytes: number;
  total_response_bytes: number;
}

export interface TokenStat {
  token_id?: number;
  token_label?: string;
  total_requests: number;
  success_requests: number;
  error_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  total_request_bytes: number;
}
