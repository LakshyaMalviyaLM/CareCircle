import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-slate-100 text-[#718096] border-slate-200/80',
    primary: 'bg-[#EAF3FC] text-[#142B4A] border-blue-200/80 font-semibold',
    accent: 'bg-[#E6F7F6] text-[#0F8C83] border-[#B2E6E2] font-semibold',
    success: 'bg-emerald-50 text-[#16A37B] border-emerald-200/80 font-medium',
    warning: 'bg-amber-50 text-[#E9A23B] border-amber-200/80 font-medium',
    danger: 'bg-rose-50 text-[#DC5555] border-rose-200/80 font-semibold',
    navy: 'bg-[#142B4A] text-white border-transparent font-medium'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
    lg: 'text-sm px-3 py-1.5 rounded-full'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-medium transition-colors ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
