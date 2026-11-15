import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-[#142B4A] hover:bg-[#1E3E6B] text-white shadow-xs hover:shadow focus:ring-[#142B4A] border border-transparent',
    accent:
      'bg-[#13A89E] hover:bg-[#0F8C83] text-white shadow-xs hover:shadow focus:ring-[#13A89E] border border-transparent',
    secondary:
      'bg-[#EAF3FC] hover:bg-[#D7E9FA] text-[#142B4A] border border-blue-100 focus:ring-blue-300 font-semibold',
    outline:
      'bg-white hover:bg-slate-50 text-[#172B4D] border border-slate-200 hover:border-slate-300 shadow-2xs focus:ring-slate-300',
    danger:
      'bg-[#DC5555] hover:bg-[#C94747] text-white shadow-xs hover:shadow focus:ring-rose-500 border border-transparent',
    dangerOutline:
      'bg-white hover:bg-rose-50 text-[#DC5555] border border-rose-200 hover:border-rose-300 focus:ring-rose-300',
    warning:
      'bg-[#E9A23B] hover:bg-[#D48F29] text-white shadow-xs focus:ring-amber-500 border border-transparent',
    ghost:
      'bg-transparent hover:bg-slate-100 text-[#172B4D] focus:ring-slate-200 border-transparent',
    success:
      'bg-[#16A37B] hover:bg-[#128866] text-white shadow-xs focus:ring-emerald-500 border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 min-h-[40px]',
    lg: 'text-base px-5 py-3 rounded-xl gap-2.5 min-h-[48px]',
    xl: 'text-lg px-6 py-3.5 rounded-2xl gap-3 min-h-[54px] font-semibold'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
