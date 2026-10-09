import { useId } from "react";

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="theme-input w-full rounded-xl border border-white/10 bg-[#242427] px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-[#665cff] focus:ring-2 focus:ring-[#665cff]/20"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterDropdown;
