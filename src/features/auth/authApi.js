import { apiSlice } from '../../api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    updateFeatures: builder.mutation({
      query: (features) => ({
        url: '/school/features',
        method: 'PUT',
        body: { features },
      }),
      invalidatesTags: ['School'],
    }),
    getSchoolProfile: builder.query({
      query: () => '/school/me',
      providesTags: ['School'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useUpdateFeaturesMutation,
  useGetSchoolProfileQuery
} = authApi;
