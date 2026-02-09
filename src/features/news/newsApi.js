import { apiSlice } from '../../api/apiSlice';

export const newsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/news?page=${page}&limit=${limit}`,
      providesTags: ['News'],
    }),
    getNewsById: builder.query({
      query: (id) => `/news/${id}`,
      providesTags: (result, error, id) => [{ type: 'News', id }],
    }),
    createNews: builder.mutation({
      query: (formData) => ({
        url: '/news',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['News'],
    }),
    updateNews: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/news/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => ['News', { type: 'News', id }],
    }),
    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['News'],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
