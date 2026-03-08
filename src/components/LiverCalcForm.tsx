import type { ChangeEvent, FormEvent } from 'react';
import { LiverCalcDisclaimer } from './LiverCalcDisclaimer';
import {
  buttonSecondary,
  buttonPrimary,
  fieldLabel,
  inputClass,
  panelInner,
  panelShell,
  sectionKicker,
} from '../lib/ui';
import type { LiverCalcFormValues, LiverCalcFormErrors } from '../types/liverCalc';

type LiverCalcFormProps = {
  values: LiverCalcFormValues;
  errors: LiverCalcFormErrors;
  submitError: string;
  loading: boolean;
  onChange: (field: keyof LiverCalcFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

type FieldConfig = {
  name: keyof LiverCalcFormValues;
  label: string;
  type?: 'number';
  step?: string;
  helper?: string;
};

const numericFields: FieldConfig[] = [
  { name: 'age', label: 'Age', type: 'number', step: '1', helper: '19 to 65 years' },
  {
    name: 'drinks_per_day',
    label: 'Drinks Per Day',
    type: 'number',
    step: '0.1',
  },
  { name: 'alp', label: 'ALP', type: 'number', step: '0.1' },
  { name: 'alt', label: 'ALT', type: 'number', step: '0.1' },
  { name: 'ast', label: 'AST', type: 'number', step: '0.1' },
  { name: 'ggt', label: 'GGT', type: 'number', step: '0.1' },
];

export function LiverCalcForm({
  values,
  errors,
  submitError,
  loading,
  onChange,
  onSubmit,
  onReset,
}: LiverCalcFormProps) {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.name as keyof LiverCalcFormValues, event.target.value);
  }

  return (
    <form className={`${panelShell} ${panelInner} space-y-6`} onSubmit={onSubmit} noValidate>
      <div className="space-y-3">
        <p className={sectionKicker}>Calculator</p>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-main)]">
            Routine blood test inputs
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[var(--text-soft)]">
            Enter six values to estimate liver risk from routine biomarkers and alcohol intake.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {numericFields.map((field) => (
          <label key={field.name} className="space-y-2.5">
            <span className={fieldLabel}>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              step={field.step}
              min="0"
              value={values[field.name]}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors[field.name])}
              placeholder={`Enter ${field.label}`}
              className={inputClass}
            />
            <div className="min-h-5">
              {errors[field.name] ? (
                <small className="text-sm text-[var(--danger)]">{errors[field.name]}</small>
              ) : field.helper ? (
                <small className="text-sm text-[var(--text-muted)]">{field.helper}</small>
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-4 border-t border-[var(--border-subtle)] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className={buttonPrimary} disabled={loading}>
            {loading ? 'Calculating...' : 'Estimate Risk'}
          </button>
          <button type="button" className={buttonSecondary} onClick={onReset} disabled={loading}>
            Reset
          </button>
        </div>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Source: Niemela, O., Niemela, M., Bloigu, R., Aalto, M., & Laatikainen, T. (2017).
          <em> Where should the safe limits of alcohol consumption stand in light of liver enzyme abnormalities in alcohol consumers?</em>{' '}
          <span className="italic">PLOS ONE, 12</span>(12), e0188574.{' '}
          <a
            href="https://doi.org/10.1371/journal.pone.0188574"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            https://doi.org/10.1371/journal.pone.0188574
          </a>
        </p>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Dataset: UCI Machine Learning Repository. (n.d.). <em>Liver disorders</em>.{' '}
          <a
            href="https://archive.ics.uci.edu/dataset/60/liver+disorders"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            https://archive.ics.uci.edu/dataset/60/liver+disorders
          </a>
        </p>
        {submitError ? <p className="text-sm text-[var(--danger)]">{submitError}</p> : null}
        <LiverCalcDisclaimer />
      </div>
    </form>
  );
}
