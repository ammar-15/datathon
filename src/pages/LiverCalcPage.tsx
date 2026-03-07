import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { LiverCalcForm } from '../components/LiverCalcForm';
import { LiverCalcResultCard } from '../components/LiverCalcResultCard';
import { runLiverCalc } from '../services/liverCalc';
import type {
  LiverCalcFormErrors,
  LiverCalcFormValues,
  LiverRiskRequest,
  LiverRiskResponse,
} from '../types/liverCalc';
import './LiverCalcPage.css';

const initialValues: LiverCalcFormValues = {
  age: '',
  drinks_per_day: '',
  alp: '',
  alt: '',
  ast: '',
  ggt: '',
};

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
  const [values, setValues] = useState<LiverCalcFormValues>(initialValues);
  const [errors, setErrors] = useState<LiverCalcFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [result, setResult] = useState<LiverRiskResponse | null>(null);

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
    setRequestError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setRequestError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const payload = toPayload(values);
      const response = await runLiverCalc(payload);
      setResult(response);
    } catch (error) {
      setResult(null);
      setRequestError(error instanceof Error ? error.message : 'Failed to calculate risk.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard calc-page">
      <section className="dashboard__hero">
        <div>
          <p className="dashboard__eyebrow">Educational liver calculator</p>
          <h1>Detecting early indicators of liver damage using routine blood tests.</h1>
          <p className="dashboard__lede">
            This page estimates a liver-related risk band from routine biomarkers and drinking
            history. It is intended for learning and demonstration, not diagnosis or treatment.
          </p>
        </div>
      </section>

      <section className="calc-layout">
        <LiverCalcForm
          values={values}
          errors={errors}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <div className="calc-layout__side">
          {requestError ? (
            <section className="state-card state-card--error">
              <h2>Could not calculate risk</h2>
              <p>{requestError}</p>
            </section>
          ) : null}
          <LiverCalcResultCard result={result} astAltRatio={astAltRatio} />
        </div>
      </section>
    </main>
  );
}
