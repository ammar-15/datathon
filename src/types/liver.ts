export type LiverRecord = {
  id: number;
  mcv: number;
  alp: number;
  alt: number;
  ast: number;
  ggt: number;
  drinks: number;
  selector: number;
  created_at: string;
};

export type LiverStatistic = {
  id: number;
  column_name: LiverVariableKey;
  mean: number;
  median: number;
  mode: number;
  std_dev: number;
  min_value: number;
  max_value: number;
  record_count: number;
  updated_at: string;
};

export type LiverVariableKey =
  | 'mcv'
  | 'alp'
  | 'alt'
  | 'ast'
  | 'ggt'
  | 'drinks'
  | 'selector';

export const liverVariables: LiverVariableKey[] = [
  'mcv',
  'alp',
  'alt',
  'ast',
  'ggt',
  'drinks',
  'selector',
];

export const liverLabels: Record<LiverVariableKey, string> = {
  mcv: 'MCV',
  alp: 'ALP',
  alt: 'ALT',
  ast: 'AST',
  ggt: 'GGT',
  drinks: 'Drinks',
  selector: 'Selector',
};
