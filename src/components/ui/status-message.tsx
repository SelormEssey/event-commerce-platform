import type { ReactNode } from 'react';

type StatusMessageProps = {
  tone: 'neutral' | 'success' | 'warning' | 'error';
  label?: string;
  children: ReactNode;
};
const symbols = {
  neutral: '○',
  success: '✓',
  warning: '!',
  error: '×',
} as const;

export function StatusMessage({ tone, label, children }: StatusMessageProps) {
  return (
    <p className="status-message" data-tone={tone}>
      <span className="status-symbol" aria-hidden="true">
        {symbols[tone]}
      </span>
      <span>
        {label && <strong className="status-label">{label}</strong>}
        {children}
      </span>
    </p>
  );
}
