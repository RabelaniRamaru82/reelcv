import React from 'react';
import styles from './Card.module.css';

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
  const cardClasses = [
    styles.card,
    interactive ? styles.cardInteractive : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  const headerClasses = [styles.cardHeader, className].filter(Boolean).join(' ');
  
  return (
    <div className={headerClasses}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;

export { Card };