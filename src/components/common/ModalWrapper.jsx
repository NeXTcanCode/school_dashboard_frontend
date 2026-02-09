import React from 'react';

const bootstrap = window.bootstrap;

const ModalWrapper = ({ id, title, children, footer, size = 'md', show = false, onHide }) => {
  const modalRef = React.useRef(null);
  const [modalInstance, setModalInstance] = React.useState(null);

  React.useEffect(() => {
    if (modalRef.current && !modalInstance) {
      const instance = new window.bootstrap.Modal(modalRef.current);
      setModalInstance(instance);
    }
  }, [modalRef, modalInstance]);

  React.useEffect(() => {
    if (modalInstance) {
      if (show) {
        modalInstance.show();
      } else {
        modalInstance.hide();
      }
    }
  }, [show, modalInstance]);

  return (
    <div
      className="modal fade"
      id={id}
      tabIndex="-1"
      ref={modalRef}
    >
      <div className={`modal-dialog modal-${size} modal-dialog-centered`}>
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body py-4">
            {children}
          </div>
          {footer && (
            <div className="modal-footer border-top-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
