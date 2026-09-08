'use client';

import { useState } from 'react';
import type { Dictionary } from '../../i18n';
import { Button } from '../ui/button';
import { StatusMessage } from '../ui/status-message';

export function DesignExamples({ text }: { text: Dictionary['interaction'] }) {
  const [complete, setComplete] = useState(false);

  return (
    <section className="interaction-panel" aria-labelledby="interaction-title">
      <p className="eyebrow">{text.eyebrow}</p>
      <h2 id="interaction-title" className="section-title">
        {text.title}
      </h2>
      <p className="section-copy">{text.description}</p>
      <div className="button-row">
        <Button onClick={() => setComplete(true)}>
          {text.primary}
          <span aria-hidden="true">↗</span>
        </Button>
        <Button variant="secondary" onClick={() => setComplete(false)}>
          {text.secondary}
        </Button>
        <Button variant="secondary" disabled>
          {text.disabled}
        </Button>
      </div>
      <div className="feedback-stack">
        <div role="status" aria-live="polite" aria-atomic="true">
          {complete ? (
            <StatusMessage tone="success" label={text.successLabel}>
              {text.success}
            </StatusMessage>
          ) : (
            <StatusMessage tone="neutral">{text.idle}</StatusMessage>
          )}
        </div>
        <StatusMessage tone="warning" label={text.warningLabel}>
          {text.warning}
        </StatusMessage>
        <StatusMessage tone="error" label={text.errorLabel}>
          {text.error}
        </StatusMessage>
      </div>
      <p className="help-text">{text.focusHint}</p>
    </section>
  );
}
