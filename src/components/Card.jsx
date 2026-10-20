import React from 'react';

export default function Card({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component 
      className={`bg-surface border border-divider rounded-xl shadow-xs transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
