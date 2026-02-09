import React from 'react';

const EmptyState = ({ title = 'No data found', message = 'There are no items to display at the moment.', icon = 'bi-folder2-open', action }) => {
  return (
    <div className="text-center py-5 px-4 bg-light rounded-3 border">
      <i className={`bi ${icon} display-1 text-muted opacity-50 mb-3`}></i>
      <h3>{title}</h3>
      <p className="text-muted mb-4">{message}</p>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
