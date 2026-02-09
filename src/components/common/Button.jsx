import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size = '', disabled = false, className = '', ...props }) => {
  const btnSize = size ? `btn-${size}` : '';
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${btnSize} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
