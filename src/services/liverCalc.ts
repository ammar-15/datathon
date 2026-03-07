import type { LiverRiskRequest, LiverRiskResponse } from '../types/liverCalc';

export async function runLiverCalc(payload: LiverRiskRequest): Promise<LiverRiskResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables for the liver calculator.');
  }

  const url = `${supabaseUrl}/functions/v1/liver-risk-calc`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Failed to run liver calculator',
    );
  }

  return data as LiverRiskResponse;
}
