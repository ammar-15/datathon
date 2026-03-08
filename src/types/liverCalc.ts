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
  id?: string;
  status?: string;
  risk_band?: 'Low' | 'Moderate' | 'High' | 'Very High' | string;
  score?: number;
  rule_score: number;
  ast_alt_ratio?: number;
  explanation?: string;
  ai_summary?: string;
  rejected_reason?: string;
  guardrails: { code: string; severity: string; message: string }[];
  score_breakdown: {
    ggt_contribution: number;
    ast_contribution: number;
    alt_contribution: number;
    alp_contribution: number;
    ast_alt_bonus: number;
    drinks_modifier: number;
    age_modifier: number;
    raw_enzyme_score: number;
    final_score: number;
  };
};
