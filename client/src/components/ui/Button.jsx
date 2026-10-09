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
      "ui-button-primary",

    secondary:
      "ui-button-secondary",

    outline:
      "ui-button-outline",

    danger:
      "bg-red-900/80 text-white hover:bg-red-800 shadow-sm",

    success:
      "bg-emerald-900/80 text-white hover:bg-emerald-800 shadow-sm",

    light:
      "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm",
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
        ui-button inline-flex items-center justify-center gap-2
        font-medium transition-colors duration-150
        disabled:cursor-not-allowed disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
