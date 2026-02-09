import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateSchoolFeatures } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { useUpdateFeaturesMutation } from '../features/auth/authApi';
import toast from 'react-hot-toast';

const SelectFeaturesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [updateFeaturesApi, { isLoading }] = useUpdateFeaturesMutation();

  const [features, setFeatures] = useState({
    news: true,
    events: true,
    gallery: true,
  });

  const handleToggle = (feature) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleSubmit = async () => {
    try {
      // Call API to update features in DB
      const result = await updateFeaturesApi(features).unwrap();

      // Update local Redux state
      dispatch(updateSchoolFeatures(features));

      toast.success('Features updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Feature update error:', err);
      toast.error(err?.data?.message || 'Failed to update features.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Select Enabled Features</h2>
        <p className="text-muted text-center mb-4">Choose which modules you want to manage for your school.</p>

        <div className="list-group mb-4">
          <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
            <div>
              <h6 className="mb-0">News Feed</h6>
              <small className="text-muted">Publish announcements and news updates.</small>
            </div>
            <input
              type="checkbox"
              className="form-check-input"
              checked={features.news}
              onChange={() => handleToggle('news')}
            />
          </label>
          <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
            <div>
              <h6 className="mb-0">Events Calendar</h6>
              <small className="text-muted">Manage school events and schedules.</small>
            </div>
            <input
              type="checkbox"
              className="form-check-input"
              checked={features.events}
              onChange={() => handleToggle('events')}
            />
          </label>
          <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
            <div>
              <h6 className="mb-0">Photo Gallery</h6>
              <small className="text-muted">Upload and showcase school activity photos.</small>
            </div>
            <input
              type="checkbox"
              className="form-check-input"
              checked={features.gallery}
              onChange={() => handleToggle('gallery')}
            />
          </label>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary w-100" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default SelectFeaturesPage;
