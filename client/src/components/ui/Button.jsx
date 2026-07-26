function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) {
  const variants = {
    primary:
      "bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm shadow-cyan-600/20",

    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 ring-1 ring-slate-700",

    outline:
      "bg-transparent text-slate-200 ring-1 ring-slate-700 hover:bg-slate-800 hover:ring-slate-600",

    danger:
      "bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/20",

    success:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20",

    light:
      "bg-white text-slate-900 hover:bg-slate-100 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-150
        active:scale-[0.97]
        disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
