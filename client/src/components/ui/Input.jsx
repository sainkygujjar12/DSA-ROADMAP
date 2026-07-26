function Input({
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
    />
  );
}

export default Input;