import React, { useState, useRef } from 'react';

const ImageUploader = ({ multiple = false, maxImages = 5, value = [], onChange }) => {
  const [previews, setPreviews] = useState(value);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = [...previews];

    files.forEach(file => {
      if (newPreviews.length < maxImages) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({ file, url: reader.result });
          setPreviews([...newPreviews]);
          onChange(multiple ? newPreviews.map(p => p.file || p.url) : newPreviews[0].file || newPreviews[0].url);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(multiple ? newPreviews.map(p => p.file || p.url) : (newPreviews[0]?.file || newPreviews[0]?.url || null));
  };

  return (
    <div className="image-uploader">
      <div className="d-flex flex-wrap gap-2 mb-2">
        {previews.map((preview, index) => (
          <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
            <img
              src={typeof preview === 'string' ? preview : preview.url}
              alt="Preview"
              className="img-thumbnail w-100 h-100 object-fit-cover"
            />
            <button
              type="button"
              className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
              style={{ width: '20px', height: '20px', fontSize: '12px' }}
              onClick={() => removeImage(index)}
            >
              &times;
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <div
            className="border rounded d-flex align-items-center justify-content-center cursor-pointer"
            style={{ width: '100px', height: '100px', borderStyle: 'dashed' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-plus fs-2 text-muted"></i>
          </div>
        )}
      </div>
      <input
        type="file"
        multiple={multiple}
        accept="image/*"
        className="d-none"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <small className="text-muted">
        {multiple ? `Max ${maxImages} images (JPG, PNG, WebP).` : 'Select an image (JPG, PNG, WebP).'}
      </small>
    </div>
  );
};

export default ImageUploader;
