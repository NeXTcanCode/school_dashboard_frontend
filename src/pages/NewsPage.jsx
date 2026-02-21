import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation
} from '../features/news/newsApi';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ModalWrapper from '../components/common/ModalWrapper';
import ImageUploader from '../components/common/ImageUploader';
import FileUploader from '../components/common/FileUploader';
import Table from '../components/common/Table';
import toast from 'react-hot-toast';

const newsSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fromDate: z.string().min(1, 'From Date is required'),
  toDate: z.string().min(1, 'To Date is required'),
  images: z.array(z.any()).optional(),
  attachment: z.any().optional(),
});

const NewsPage = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading: isNewsLoading } = useGetNewsQuery({ page, limit: 10 });
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      description: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      images: [],
      attachment: null
    }
  });

  const newsImages = watch('images');
  const newsAttachment = watch('attachment');

  const handleOpenCreate = () => {
    setEditingItem(null);
    reset({
      title: '',
      description: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      images: [],
      attachment: null
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({
      title: item.title,
      description: item.description,
      fromDate: item.fromDate ? new Date(item.fromDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      toDate: item.toDate ? new Date(item.toDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      images: item.images || [],
      attachment: item.attachment || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteNews(id).unwrap();
        toast.success('News item deleted');
      } catch (err) {
        toast.error('Failed to delete news item');
      }
    }
  };

  const onSubmit = async (formData) => {
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('fromDate', formData.fromDate);
    payload.append('toDate', formData.toDate);

    // Add images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(img => {
        if (img instanceof File) {
          payload.append('images', img);
        } else {
          payload.append('existingImages', img);
        }
      });
    }

    // Add attachment
    if (formData.attachment && formData.attachment instanceof File) {
      payload.append('attachment', formData.attachment);
    }

    try {
      if (editingItem) {
        await updateNews({ id: editingItem._id, formData: payload }).unwrap();
        toast.success('News updated successfully!');
      } else {
        await createNews(payload).unwrap();
        toast.success('News created successfully!');
      }
      setShowModal(false);
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: info => <span className="fw-bold">{info.getValue()}</span>
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: info => (
        <div className="text-truncate" style={{ maxWidth: '300px' }} title={info.getValue()}>
          {info.getValue()}
        </div>
      )
    },
    {
      header: 'From Date',
      accessorKey: 'fromDate',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    },
    {
      header: 'To Date',
      accessorKey: 'toDate',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    },
    {
      header: 'Attachment',
      accessorKey: 'attachment',
      cell: info => info.getValue() ? (
        <a href={info.getValue()} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-paperclip"></i> View
        </a>
      ) : '-'
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: info => (
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(info.row.original)}>
            <i className="bi bi-pencil"></i>
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(info.row.original._id)}>
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      )
    }
  ], []);

  if (isNewsLoading) return <Loader fullPage />;

  return (
    <div className="container-fluid content-page px-0">
      <div className="content-page-header">
        <div>
          <h2 className="content-page-title">News Feed</h2>
          <p className="content-page-subtitle">Share updates with a focused, readable feed.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg me-2"></i> Create News
        </Button>
      </div>

      <Table
        data={data?.data || []}
        columns={columns}
        isLoading={isNewsLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageCount={data?.pagination?.totalPages} // Pass totalPages for server-side pagination check
        emptyMessage="Start by creating your first news update for the school."
        emptyTitle="No news yet"
        emptyAction={{ label: 'Create Now', onClick: handleOpenCreate }}
      />

      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingItem ? 'Edit News' : 'Create News'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              {...register('title')}
            />
            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="5"
              {...register('description')}
            />
            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className={`form-control ${errors.fromDate ? 'is-invalid' : ''}`}
                {...register('fromDate')}
              />
              {errors.fromDate && <div className="invalid-feedback">{errors.fromDate.message}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className={`form-control ${errors.toDate ? 'is-invalid' : ''}`}
                {...register('toDate')}
              />
              {errors.toDate && <div className="invalid-feedback">{errors.toDate.message}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
               <FileUploader
                  label="Attachment (PDF/Doc)"
                  value={newsAttachment}
                  onChange={(file) => setValue('attachment', file)}
               />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Images (Max 5)</label>
            <ImageUploader
              multiple
              value={newsImages}
              onChange={(files) => setValue('images', files)}
            />
          </div>
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? <Loader size="sm" /> : (editingItem ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
};

export default NewsPage;
