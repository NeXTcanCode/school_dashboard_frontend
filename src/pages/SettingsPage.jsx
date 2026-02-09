import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, updateSchoolName, updateSchoolFeatures } from '../features/auth/authSlice';
import { useUpdateFeaturesMutation } from '../features/auth/authApi';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  schoolName: z.string().min(3, 'School name required'),
  features: z.object({
    news: z.boolean(),
    events: z.boolean(),
    gallery: z.boolean(),
  }),
});

const SettingsPage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [updateFeatures, { isLoading }] = useUpdateFeaturesMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      schoolName: user?.schoolName || '',
      features: {
        news: user?.features?.news ?? true,
        events: user?.features?.events ?? true,
        gallery: user?.features?.gallery ?? true,
      }
    }
  });

  useEffect(() => {
    reset({
      schoolName: user?.schoolName || '',
      features: {
        news: user?.features?.news ?? true,
        events: user?.features?.events ?? true,
        gallery: user?.features?.gallery ?? true,
      }
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('Submitting features:', data.features);
      const result = await updateFeatures(data.features).unwrap();
      console.log('Update result:', result);

      // Update local Redux state
      dispatch(updateSchoolName(data.schoolName));

      if (result?.features) {
        dispatch(updateSchoolFeatures(result.features));
      } else if (result?.data?.features) {
        dispatch(updateSchoolFeatures(result.data.features));
      } else {
        dispatch(updateSchoolFeatures(data.features));
      }

      toast.success('Settings updated successfully!');
    } catch (err) {
      console.error('Settings update error:', err);
      toast.error(err?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="container-fluid" style={{ maxWidth: '800px' }}>
      <h2 className="mb-4">School Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="General Information" className="mb-4">
          <div className="mb-3">
            <label className="form-label">School Name</label>
            <input
              type="text"
              className={`form-control ${errors.schoolName ? 'is-invalid' : ''}`}
              {...register('schoolName')}
            />
            {errors.schoolName && <div className="invalid-feedback">{errors.schoolName.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">School Code</label>
            <input type="text" className="form-control" value={user?.schoolCode || ''} disabled />
            <small className="text-muted">School code cannot be changed.</small>
          </div>
        </Card>

        <Card title="Manage Features" className="mb-4">
          <p className="text-muted mb-4">Toggle modules on/off for your school's public website.</p>
          <div className="list-group">
            <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
              <div>
                <h6 className="mb-0">News Feed</h6>
                <small className="text-muted">Announcements and news updates.</small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  {...register('features.news')}
                />
              </div>
            </label>
            <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
              <div>
                <h6 className="mb-0">Events Calendar</h6>
                <small className="text-muted">School events and schedules.</small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  {...register('features.events')}
                />
              </div>
            </label>
            <label className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
              <div>
                <h6 className="mb-0">Photo Gallery</h6>
                <small className="text-muted">Activity photos and showcases.</small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  {...register('features.gallery')}
                />
              </div>
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-end">
          <Button type="submit" disabled={isLoading} className="px-5">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
