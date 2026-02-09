import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetSchoolProfileQuery } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { data: profile, isSuccess } = useGetSchoolProfileQuery();

  useEffect(() => {
    if (isSuccess && profile) {
      // Update user data in Redux when profile is fetched
      const token = sessionStorage.getItem('token');
      if (token) {
        dispatch(setCredentials({ user: profile, token }));
      }
    }
  }, [profile, isSuccess, dispatch]);

  return (
    <div className="dashboard-layout container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0 bg-dark min-vh-100 shadow">
          <Sidebar />
        </div>
        <main className="col-md-9 col-lg-10 ms-sm-auto px-md-4 py-4 dashboard-main">
          <div className="dashboard-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
