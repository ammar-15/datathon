export type LiverRecord = {
  id: number;
  mcv: number;
  alkphos: number;
  sgpt: number;
  sgot: number;
  gammagt: number;
  drinks: number;
  selector: number;
  created_at: string;
};

export type LiverNumericKey =
  | 'mcv'
  | 'alkphos'
  | 'sgpt'
  | 'sgot'
  | 'gammagt'
  | 'drinks'
  | 'selector';
