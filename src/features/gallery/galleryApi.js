import { apiSlice } from '../../api/apiSlice';

export const galleryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/gallery?page=${page}&limit=${limit}`,
      providesTags: ['Gallery'],
    }),
    createGalleryItem: builder.mutation({
      query: (formData) => ({
        url: '/gallery',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery'],
    }),
    updateGalleryItem: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/gallery/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => ['Gallery', { type: 'Gallery', id }],
    }),
    deleteGalleryItem: builder.mutation({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gallery'],
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApi;
