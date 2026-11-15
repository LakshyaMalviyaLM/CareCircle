import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  bordered = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl ${
        bordered ? 'border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]' : ''
      } ${
        hoverEffect
          ? 'card-hover cursor-pointer transition-all duration-200 hover:border-slate-300'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
