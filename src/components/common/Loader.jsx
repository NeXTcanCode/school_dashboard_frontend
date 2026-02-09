import React from 'react';

const Loader = ({ fullPage = false, size = 'md', className = '' }) => {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : (size === 'lg' ? 'spinner-border-lg' : '');

  const spinner = (
    <div className={`spinner-border text-primary ${spinnerSize} ${className}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 w-100 py-5">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
