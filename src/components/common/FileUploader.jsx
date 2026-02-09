import React, { useRef, useState } from 'react';

const FileUploader = ({ accept = ".pdf,.doc,.docx", label = "Upload File", onChange, value }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(value ? (typeof value === 'string' ? value.split('/').pop() : value.name) : '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type="file"
          className="form-control"
          id="inputGroupFile"
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: fileName ? 'none' : 'block' }}
        />
        {fileName && (
          <div className="form-control d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center">
                <i className="bi bi-file-earmark-text me-2"></i>
                <span className="text-truncate">{fileName}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Remove"
              onClick={handleRemove}
            ></button>
          </div>
        )}
      </div>
      <div className="form-text">Accepted formats: PDF, DOC, DOCX. Max size: 5MB.</div>
    </div>
  );
};

export default FileUploader;
