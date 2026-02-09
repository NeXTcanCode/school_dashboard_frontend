import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { useSignupMutation } from '../features/auth/authApi';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  schoolCode: z.string().min(3, 'School code must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { ...signupData } = data;
      delete signupData.confirmPassword;

      const result = await signup(signupData).unwrap();

      // Backend returns: { success: true, data: { id, schoolCode, schoolName, token } }
      const { token, id, schoolCode, schoolName } = result.data;

      const user = {
        id,
        schoolCode,
        schoolName,
        features: { news: false, events: false, gallery: false }
      };

      dispatch(setCredentials({ user, token }));

      toast.success('Account created! Now select your features.');
      navigate('/select-features');
    } catch (err) {
      toast.error(err?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="text-center mb-4">Register School</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <label className="form-label">School Code (Unique ID)</label>
            <input
              type="text"
              className={`form-control ${errors.schoolCode ? 'is-invalid' : ''}`}
              {...register('schoolCode')}
              placeholder="e.g. greenwood-high"
            />
            {errors.schoolCode && <div className="invalid-feedback">{errors.schoolCode.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register('password')}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
