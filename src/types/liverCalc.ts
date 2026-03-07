export type LiverCalcFormValues = {
  age: string;
  drinks_per_day: string;
  alp: string;
  alt: string;
  ast: string;
  ggt: string;
};

export type LiverCalcFormErrors = Partial<Record<keyof LiverCalcFormValues, string>>;

export type LiverRiskRequest = {
  age: number;
  drinks_per_day: number;
  alp: number;
  alt: number;
  ast: number;
  ggt: number;
};

export type LiverRiskResponse = {
  status?: string;
  risk_band?: 'Low' | 'Moderate' | 'High' | 'Very High' | string;
  score?: number;
  explanation?: string;
  ai_summary?: string;
  rejected_reason?: string;
};
