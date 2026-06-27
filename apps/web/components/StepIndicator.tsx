'use client';

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      {steps.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                height: '4px',
                borderRadius: '2px',
                background: isDone ? '#111' : isActive ? '#555' : '#e5e7eb',
                marginBottom: '0.5rem',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: isActive ? '#111' : '#9ca3af' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
