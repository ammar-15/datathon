export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const pageShell =
  'mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8';

export const panelShell =
  'rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-card)]';

export const panelInner = 'p-5 sm:p-6';

export const sectionKicker =
  'text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]';

export const sectionTitle =
  'text-2xl font-semibold tracking-[-0.03em] text-[var(--text-main)] sm:text-[2rem]';

export const sectionSubtitle = 'max-w-2xl text-sm leading-6 text-[var(--text-soft)]';

export const cardTitle = 'text-lg font-semibold tracking-[-0.02em] text-[var(--text-main)]';

export const fieldLabel =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]';

export const inputClass =
  'h-11 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring-soft)]';

export const textareaClass =
  'w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring-soft)]';

export const buttonPrimary =
  'inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_0_0_1px_var(--accent-soft)] disabled:cursor-wait disabled:opacity-60';

export const buttonSecondary =
  'inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50';

export const stateCard =
  'rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]';

export const tableWrap =
  'overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-strong)]';

export function tabClass(active: boolean) {
  return cn(
    'inline-flex h-10 items-center rounded-lg border px-3.5 text-sm font-medium transition',
    active
      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
      : 'border-transparent text-[var(--text-soft)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]',
  );
}
