import axios, { type AxiosInstance, AxiosError } from 'axios';
import { getConfig } from './config.js';

let cached: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (cached) return cached;
  const cfg = getConfig();
  cached = axios.create({
    baseURL: cfg.DEVMIND_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${cfg.DEVMIND_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
  return cached;
}

export function formatApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string; code?: string } | undefined;
    const status = err.response?.status;
    if (data?.error) return `[${status ?? '?'}] ${data.error}`;
    if (err.message) return err.message;
  }
  return err instanceof Error ? err.message : String(err);
}
