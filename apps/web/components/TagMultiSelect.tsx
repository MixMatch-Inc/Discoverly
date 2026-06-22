'use client';

interface TagMultiSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  label: string;
}

export function TagMultiSelect({
  options,
  selected,
  onChange,
  max,
  label,
}: TagMultiSelectProps) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, tag]);
    }
  }

  return (
    <div>
      <p>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && max !== undefined && selected.length >= max;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={isDisabled}
              style={{
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {max && (
        <p>{selected.length} of {max} selected</p>
      )}
    </div>
  );
}
