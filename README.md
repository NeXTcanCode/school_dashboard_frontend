# Frontend – School Dashboard

React-based admin dashboard for multi-tenant school content management.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vite + React 18 |
| State | Redux Toolkit + RTK Query |
| Routing | react-router-dom v6 |
| Forms | react-hook-form + Zod |
| Styling | Bootstrap 5.0 (CDN) |
| Tables | @tanstack/react-table |
| Toast | react-hot-toast |

> [!IMPORTANT]
> No TypeScript. No extra icon libraries. No axios.

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── apiSlice.js           # RTK Query base + auth header
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.js      # JWT + user state
│   │   │   └── authApi.js        # login, signup endpoints
│   │   ├── news/
│   │   │   └── newsApi.js        # injectEndpoints for news
│   │   ├── events/
│   │   │   └── eventsApi.js
│   │   ├── gallery/
│   │   │   └── galleryApi.js
│   │   └── settings/
│   │       └── settingsApi.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ModalWrapper.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ImageUploader.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       └── DashboardLayout.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── SelectFeaturesPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── NewsPage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── GalleryPage.jsx
│   │   └── SettingsPage.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useSchoolFeatures.js
│   │
│   ├── utils/
│   │   ├── dateFormat.js
│   │   └── draftStorage.js       # sessionStorage draft save/restore
│   │
│   ├── store.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
└── vite.config.js
```

---

## Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐    ┌───────────┐
│  LoginPage  │───▶│   Backend   │───▶│  sessionStorage  │───▶│ Dashboard │
│ schoolCode  │    │  /api/auth  │    │   JWT stored     │    │   Home    │
│  password   │    │   login     │    │   per-tab only   │    │           │
└─────────────┘    └─────────────┘    └──────────────────┘    └───────────┘
```

### Session Rules
- JWT stored in `sessionStorage` (not localStorage)
- New tab = new login required
- Token includes: `schoolCode`, `schoolName`, `features`

### Signup Flow
1. SignupPage → POST /api/auth/signup
2. Redirect to SelectFeaturesPage
3. User toggles news/events/gallery
4. PATCH /api/school/features → Dashboard

---

## RTK Query Setup

### Base API (`src/api/apiSlice.js`)

```js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['News', 'Events', 'Gallery', 'School'],
  endpoints: () => ({}),
});
```

### Feature API Example (`src/features/news/newsApi.js`)

```js
import { apiSlice } from '../../api/apiSlice';

export const newsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query({
      query: ({ page = 1, limit = 10 }) => `/news?page=${page}&limit=${limit}`,
      providesTags: ['News'],
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
      invalidatesTags: ['News'],
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
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
```

---

## File Upload Rules

| Type | Limit | Formats | Size |
|------|-------|---------|------|
| Images | 0-5 (Gallery: 1-5 required) | jpg, jpeg, png, webp | 1 MB each |
| Attachment | 0-1 | PDF only | 1 MB |

### Upload Component Behavior
1. User selects files
2. Display image grid preview / PDF filename
3. On form submit → send as FormData to backend
4. Backend uploads to Cloudinary → returns URLs

---

## Page Features

### Dashboard Home
- Stats cards: News count, Events count, Gallery count
- No quick action buttons (user navigates via sidebar)

### News / Events / Gallery Pages
- List view with TanStack Table
- Pagination (page & limit)
- Create modal with form
- Edit via PATCH (can add/remove/replace images)
- Delete with confirmation modal

### Settings Page
- Edit schoolName
- Toggle features (news/events/gallery)
- Change password
- After save → refetch school data to update sidebar

---

## UI/UX Rules

| Feature | Implementation |
|---------|----------------|
| Toast notifications | react-hot-toast |
| Error boundary | Detailed errors in dev mode |
| Loading states | Skeleton components |
| Empty states | Illustration + CTA button |
| Delete confirmation | Generic modal "Are you sure?" |
| Logout | Immediate (no confirm) |
| Draft save | Save to sessionStorage before submit |
| Disabled feature | Redirect to Settings page |

---

## Route Protection

### Protected Routes (require auth)
- `/dashboard`
- `/news`
- `/events`
- `/gallery`
- `/settings`

### Feature-Gated Routes
- `/news` → only if `features.news === true`
- `/events` → only if `features.events === true`
- `/gallery` → only if `features.gallery === true`

If feature disabled → redirect to `/settings` with toast "Enable this feature in settings"

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Scripts

```bash
npm install
npm run dev      # Start dev server on port 5173
npm run build    # Production build
npm run preview  # Preview production build
```
# school_dashboard_frontend
