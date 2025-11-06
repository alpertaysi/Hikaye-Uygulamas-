
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-bold rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 disabled:bg-brand-subtext disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-brand-accent"
    >
      {children}
    </button>
  );
};
