import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { LiverCalcForm } from '../components/LiverCalcForm';
import { LiverCalcResultCard } from '../components/LiverCalcResultCard';
import { pageShell, panelInner, panelShell, sectionKicker, sectionSubtitle, sectionTitle } from '../lib/ui';
import { runLiverCalc } from '../services/liverCalc';
import type {
  LiverCalcFormErrors,
  LiverCalcFormValues,
  LiverRiskRequest,
  LiverRiskResponse,
} from '../types/liverCalc';

const initialValues: LiverCalcFormValues = {
  age: '',
  drinks_per_day: '',
  alp: '',
  alt: '',
  ast: '',
  ggt: '',
};

const LIVER_CALC_CACHE_KEY = 'liverscope-calc-cache';

function validate(values: LiverCalcFormValues): LiverCalcFormErrors {
  const errors: LiverCalcFormErrors = {};
  const numericFields: Array<keyof LiverCalcFormValues> = [
    'age',
    'drinks_per_day',
    'alp',
    'alt',
    'ast',
    'ggt',
  ];

  numericFields.forEach((field) => {
    const rawValue = values[field];
    if (rawValue === '') {
      errors[field] = 'This field is required.';
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      errors[field] = 'Enter a valid number.';
      return;
    }

    if (parsed < 0) {
      errors[field] = 'Value must be 0 or greater.';
    }
  });

  if (values.age !== '') {
    const age = Number(values.age);
    if (!Number.isInteger(age)) {
      errors.age = 'Age must be a whole number.';
    } else if (age < 19) {
      errors.age = 'This educational calculator only supports ages 19 to 65.';
    } else if (age > 65) {
      errors.age = 'This educational calculator only supports ages 19 to 65.';
    }
  }

  return errors;
}

function toPayload(values: LiverCalcFormValues): LiverRiskRequest {
  return {
    age: Number(values.age),
    drinks_per_day: Number(values.drinks_per_day),
    alp: Number(values.alp),
    alt: Number(values.alt),
    ast: Number(values.ast),
    ggt: Number(values.ggt),
  };
}

export function LiverCalcPage() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseFunctionsUrl = supabaseUrl ? `${supabaseUrl}/functions/v1` : '';
  const [values, setValues] = useState<LiverCalcFormValues>(initialValues);
  const [errors, setErrors] = useState<LiverCalcFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<LiverRiskResponse | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LIVER_CALC_CACHE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        values?: LiverCalcFormValues;
        result?: LiverRiskResponse | null;
        aiSummary?: string | null;
      };

      if (parsed.values) {
        setValues({ ...initialValues, ...parsed.values });
      }

      if (parsed.result) {
        setResult(parsed.result);
      }

      if (parsed.aiSummary != null) {
        setAiSummary(parsed.aiSummary);
      }
    } catch {
      window.localStorage.removeItem(LIVER_CALC_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      values,
      result,
      aiSummary,
    });

    window.localStorage.setItem(LIVER_CALC_CACHE_KEY, payload);
  }, [values, result, aiSummary]);

  const astAltRatio = useMemo(() => {
    const alt = Number(values.alt);
    const ast = Number(values.ast);

    if (!Number.isFinite(alt) || !Number.isFinite(ast) || alt <= 0) {
      return null;
    }

    return ast / alt;
  }, [values.alt, values.ast]);

  function handleChange(field: keyof LiverCalcFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  }

  function handleReset() {
    setValues(initialValues);
    setErrors({});
    setLoading(false);
    setSubmitError('');
    setResult(null);
    setAiSummary(null);
    setAiLoading(false);
    window.localStorage.removeItem(LIVER_CALC_CACHE_KEY);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitError('');
    setResult(null);
    setAiSummary(null);
    setAiLoading(false);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const formValues = toPayload(values);
      const response = await runLiverCalc(formValues);
      setResult(response);

      if (!supabaseFunctionsUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables for the liver calculator.');
      }

      setAiLoading(true);
      try {
        const aiRes = await fetch(`${supabaseFunctionsUrl}/liver-ai-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
          body: JSON.stringify({
            record_id: response.id,
            age: formValues.age,
            drinks_per_day: formValues.drinks_per_day,
            alp: formValues.alp,
            alt: formValues.alt,
            ast: formValues.ast,
            ggt: formValues.ggt,
            rule_score: response.rule_score,
            risk_band: response.risk_band,
            ast_alt_ratio: response.ast_alt_ratio,
            explanation: response.explanation,
            guardrails: response.guardrails ?? [],
          }),
        });
        const aiData = await aiRes.json();
        setAiSummary(aiData.ai_summary ?? null);
      } catch {
        setAiSummary(null);
      } finally {
        setAiLoading(false);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={pageShell}>
      <section className={`${panelShell} ${panelInner} space-y-4`}>
        <div className="space-y-3">
          <p className={sectionKicker}>Clinical Estimator</p>
          <h1 className={sectionTitle}>Liver risk calculator</h1>
        </div>
        <p className={sectionSubtitle}>
          Estimate liver-related risk from routine biomarkers and alcohol intake for educational
          use.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
        <LiverCalcForm
          values={values}
          errors={errors}
          submitError={submitError}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <div className="lg:sticky lg:top-24">
          <LiverCalcResultCard
            result={result}
            astAltRatio={astAltRatio}
            aiSummary={aiSummary}
            aiLoading={aiLoading}
            ggt={result ? Number(values.ggt) : null}
            drinksPerDay={result ? Number(values.drinks_per_day) : null}
          />
        </div>
      </section>
    </main>
  );
}
