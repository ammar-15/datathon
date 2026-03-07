import { supabase } from '../lib/supabase';
import type { LiverRecord, LiverStatistic } from '../types/liver';

export async function fetchLiverRecords(): Promise<LiverRecord[]> {
  const { data, error } = await supabase
    .from('bupa_liver_records')
    .select('id, mcv, alp, alt, ast, ast_alt_ratio, ggt, drinks, selector, created_at')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LiverRecord[];
}

export async function fetchLiverStatistics(): Promise<LiverStatistic[]> {
  const { data, error } = await supabase
    .from('bupa_liver_statistics')
    .select('*')
    .order('column_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LiverStatistic[];
}
