import { supabase } from '../lib/supabase';
import type { LiverRecord } from '../types/liver';

export async function fetchLiverRecords(): Promise<LiverRecord[]> {
  const { data, error } = await supabase
    .from('bupa_liver_records')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies LiverRecord[];
}
