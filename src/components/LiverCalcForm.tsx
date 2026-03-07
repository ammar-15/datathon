import type { ChangeEvent, FormEvent } from 'react';
import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import type { LiverCalcFormValues, LiverCalcFormErrors } from '../types/liverCalc';

type LiverCalcFormProps = {
  values: LiverCalcFormValues;
  errors: LiverCalcFormErrors;
  loading: boolean;
  onChange: (field: keyof LiverCalcFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type FieldConfig = {
  name: keyof LiverCalcFormValues;
  label: string;
  type?: 'number';
  step?: string;
  helper: string;
};

const numericFields: FieldConfig[] = [
  { name: 'age', label: 'Age', type: 'number', step: '1', helper: 'Allowed range: 19 to 65 years.' },
  {
    name: 'drinks_per_day',
    label: 'Drinks Per Day',
    type: 'number',
    step: '0.1',
    helper: 'Enter the average number of alcoholic drinks consumed per day.',
  },
  { name: 'alp', label: 'ALP', type: 'number', step: '0.1', helper: 'Alkaline phosphatase value.' },
  { name: 'alt', label: 'ALT', type: 'number', step: '0.1', helper: 'Alanine aminotransferase value.' },
  { name: 'ast', label: 'AST', type: 'number', step: '0.1', helper: 'Aspartate aminotransferase value.' },
  { name: 'ggt', label: 'GGT', type: 'number', step: '0.1', helper: 'Gamma-glutamyl transferase value.' },
];

export function LiverCalcForm({
  values,
  errors,
  loading,
  onChange,
  onSubmit,
}: LiverCalcFormProps) {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.name as keyof LiverCalcFormValues, event.target.value);
  }

  return (
    <form className="calc-form panel" onSubmit={onSubmit} noValidate>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Educational estimator</p>
          <h2>Routine Blood Test Inputs</h2>
        </div>
        <p className="section-heading__copy">
          Enter routine blood test values to estimate a liver risk band for educational purposes.
        </p>
      </div>

      <div className="calc-form__grid">
        {numericFields.map((field) => (
          <label key={field.name} className="calc-field">
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              step={field.step}
              min="0"
              value={values[field.name]}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors[field.name])}
              placeholder={`Enter ${field.label}`}
            />
            <small className="helper-text">{field.helper}</small>
            {errors[field.name] ? <small className="calc-field__error">{errors[field.name]}</small> : null}
          </label>
        ))}
      </div>

      <div className="calc-form__footer">
        <button type="submit" className="calc-submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Estimate Risk'}
        </button>
        <LiverCalcDisclaimer />
      </div>
    </form>
  );
}
