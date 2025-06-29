import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & { Header: React.FC<CardHeaderProps> } = ({
  children,
  className = '',
  interactive = false,
  onClick
}) => {
  const baseClasses = 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6';
  const interactiveClasses = interactive ? 'cursor-pointer hover:border-slate-600/50 transition-colors' : '';
  const classes = `${baseClasses} ${interactiveClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;

export { Card };