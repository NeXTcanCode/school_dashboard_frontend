import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

export const useSchoolFeatures = () => {
  const user = useSelector(selectCurrentUser);

  const features = user?.features || {
    news: false,
    events: false,
    gallery: false
  };

  const isFeatureEnabled = (featureName) => {
    return !!features[featureName];
  };

  return {
    features,
    isFeatureEnabled
  };
};
