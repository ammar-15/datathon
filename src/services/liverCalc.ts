import type { LiverRiskRequest, LiverRiskResponse } from '../types/liverCalc';
import { calculateLiverRisk } from '../lib/liverRiskCalc';

export async function runLiverCalc(payload: LiverRiskRequest): Promise<LiverRiskResponse> {
  // Use client-side calculation based on ML model feature importance
  return new Promise((resolve) => {
    // Simulate async operation for consistent UX
    setTimeout(() => {
      const result = calculateLiverRisk(payload);
      resolve(result);
    }, 300);
  });
}
