import type { LiverRiskRequest, LiverRiskResponse } from '../types/liverCalc';

/**
 * Client-side liver risk calculator
 * Based on BUPA liver dataset feature importance and clinical guidelines
 */

type RiskBand = 'Low' | 'Moderate' | 'High' | 'Very High';

function calculateAstAltRatio(ast: number, alt: number): number {
  if (alt === 0) return 0;
  return ast / alt;
}

function getRiskBand(score: number): RiskBand {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 85) return 'High';
  return 'Very High';
}

function generateExplanation(
  riskBand: RiskBand,
  astAltRatio: number,
  ggtContribution: number,
  drinksModifier: number,
): string {
  const parts: string[] = [];

  if (riskBand === 'Very High') {
    parts.push('Multiple biomarkers indicate significant liver stress.');
  } else if (riskBand === 'High') {
    parts.push('Elevated biomarkers suggest increased liver-related risk.');
  } else if (riskBand === 'Moderate') {
    parts.push('Some biomarkers are outside normal ranges.');
  } else {
    parts.push('Biomarkers are within acceptable ranges.');
  }

  if (ggtContribution > 15) {
    parts.push('GGT elevation is a strong contributor to this risk assessment.');
  }

  if (astAltRatio > 2.0) {
    parts.push('AST/ALT ratio >2 may indicate advanced liver changes.');
  } else if (astAltRatio > 1.0) {
    parts.push('AST/ALT ratio >1 suggests possible liver stress.');
  }

  if (drinksModifier > 10) {
    parts.push('Reported alcohol intake significantly elevates risk.');
  }

  return parts.join(' ');
}

export function calculateLiverRisk(payload: LiverRiskRequest): LiverRiskResponse {
  const { age, drinks_per_day, alp, alt, ast, ggt } = payload;

  // Calculate AST/ALT ratio (important feature from ML model)
  // Real data: AST mean=24.6, ALT mean=30.4, ratio typically 0.5-1.5
  const astAltRatio = calculateAstAltRatio(ast, alt);

  // Score contributions based on actual data distributions:
  // - GGT: median=25, mean=38, range 5-297 (highly skewed, top predictor)
  // - AST: median=23, mean=24.6, range 5-82
  // - ALT: median=26, mean=30.4, range 4-155
  // - ALP: median=67, mean=69.9, range 23-138
  
  // GGT is the strongest predictor (importance: 0.196)
  // Scale: 0-50=low, 50-100=moderate, 100+=high
  const ggtContribution = Math.min((ggt / 50) * 25, 40);
  
  // AST/ALT ratio is most important (importance: 0.212)
  // Clinical: <1 normal, 1-2 possible concern, >2 significant
  let astAltBonus = 0;
  if (astAltRatio >= 2.0) {
    astAltBonus = 20; // Very significant
  } else if (astAltRatio >= 1.5) {
    astAltBonus = 12;
  } else if (astAltRatio >= 1.0) {
    astAltBonus = 6;
  } else if (astAltRatio >= 0.8) {
    astAltBonus = 2; // Slightly elevated
  }
  
  // AST contribution (importance: 0.017)
  // Normal range: ~10-40 U/L, our data median: 23
  const astContribution = Math.min(Math.max((ast - 40) / 10, 0) * 8, 15);
  
  // ALT contribution (importance: 0.019)
  // Normal range: ~10-40 U/L, our data median: 26
  const altContribution = Math.min(Math.max((alt - 40) / 15, 0) * 8, 15);
  
  // ALP contribution (importance: 0.040)
  // Normal range: ~40-120 U/L, our data mean: 69.9
  const alpContribution = Math.min(Math.max((alp - 120) / 20, 0) * 6, 12);

  // Drinks modifier (importance: 0.062)
  // Our data: mean=3.46, median=3, max=20
  // >4 drinks/day increases risk significantly
  const drinksModifier = Math.min(drinks_per_day * 2.5, 20);

  // Age modifier (older age increases metabolic risk)
  const ageModifier = age > 50 ? Math.min((age - 50) / 5, 5) : 0;

  const rawEnzymeScore =
    ggtContribution + astContribution + altContribution + alpContribution;

  const finalScore = Math.min(
    rawEnzymeScore + astAltBonus + drinksModifier + ageModifier,
    100,
  );

  const riskBand = getRiskBand(finalScore);

  const guardrails: { code: string; severity: string; message: string }[] = [];

  // GGT thresholds based on actual data distribution
  if (ggt > 100) {
    guardrails.push({
      code: 'GGT_VERY_HIGH',
      severity: 'high',
      message: 'GGT is significantly elevated (>100 U/L). Consult a healthcare provider.',
    });
  } else if (ggt > 60) {
    guardrails.push({
      code: 'GGT_HIGH',
      severity: 'moderate',
      message: 'GGT is elevated above normal range. Consider clinical follow-up.',
    });
  }

  if (astAltRatio >= 2.0) {
    guardrails.push({
      code: 'AST_ALT_RATIO_HIGH',
      severity: 'high',
      message: 'AST/ALT ratio ≥2.0 may indicate advanced liver changes or alcohol-related damage.',
    });
  } else if (astAltRatio >= 1.5) {
    guardrails.push({
      code: 'AST_ALT_RATIO_ELEVATED',
      severity: 'moderate',
      message: 'AST/ALT ratio is elevated. This pattern warrants clinical evaluation.',
    });
  }

  if (alt > 80) {
    guardrails.push({
      code: 'ALT_VERY_HIGH',
      severity: 'high',
      message: 'ALT is significantly elevated, suggesting liver cell damage.',
    });
  }

  if (ast > 60) {
    guardrails.push({
      code: 'AST_VERY_HIGH',
      severity: 'high',
      message: 'AST is significantly elevated. Multiple causes possible; requires evaluation.',
    });
  }

  if (drinks_per_day >= 4) {
    guardrails.push({
      code: 'ALCOHOL_HIGH',
      severity: 'moderate',
      message: `${drinks_per_day} drinks/day exceeds low-risk guidelines (typically <2-3/day).`,
    });
  }

  const explanation = generateExplanation(
    riskBand,
    astAltRatio,
    ggtContribution,
    drinksModifier,
  );

  return {
    id: `calc-${Date.now()}`,
    status: 'success',
    risk_band: riskBand,
    score: Math.round(finalScore * 10) / 10,
    rule_score: Math.round(finalScore * 10) / 10,
    ast_alt_ratio: Math.round(astAltRatio * 100) / 100,
    explanation,
    guardrails,
    score_breakdown: {
      ggt_contribution: Math.round(ggtContribution * 10) / 10,
      ast_contribution: Math.round(astContribution * 10) / 10,
      alt_contribution: Math.round(altContribution * 10) / 10,
      alp_contribution: Math.round(alpContribution * 10) / 10,
      ast_alt_bonus: Math.round(astAltBonus * 10) / 10,
      drinks_modifier: Math.round(drinksModifier * 10) / 10,
      age_modifier: Math.round(ageModifier * 10) / 10,
      raw_enzyme_score: Math.round(rawEnzymeScore * 10) / 10,
      final_score: Math.round(finalScore * 10) / 10,
    },
  };
}
