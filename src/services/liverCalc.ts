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
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to run liver calculator');
  }

  return response.json();
}
