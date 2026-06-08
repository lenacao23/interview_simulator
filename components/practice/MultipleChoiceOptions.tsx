'use client';

export function MultipleChoiceOptions({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option, i) => {
        const isSelected = selected === option;
        return (
          <label
            key={i}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="mcq"
              value={option}
              checked={isSelected}
              onChange={() => onChange(option)}
              className="mt-0.5 accent-indigo-600"
            />
            <span className={`text-sm leading-relaxed ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}
