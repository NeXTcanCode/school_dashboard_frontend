import React from 'react';

const Card = ({ children, title, subtitle, footer, className = '', bodyClassName = '', ...props }) => {
  return (
    <div className={`card shadow-sm ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header bg-white py-3">
          {title && <h5 className="card-title mb-0">{title}</h5>}
          {subtitle && <p className="card-subtitle text-muted mt-1 mb-0 small">{subtitle}</p>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="card-footer bg-light border-top-0 py-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
