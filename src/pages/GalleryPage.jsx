import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation
} from '../features/gallery/galleryApi';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ModalWrapper from '../components/common/ModalWrapper';
import ImageUploader from '../components/common/ImageUploader';
import FileUploader from '../components/common/FileUploader';
import Table from '../components/common/Table';
import toast from 'react-hot-toast';

const gallerySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  images: z.array(z.any()).min(1, 'At least one image is required'),
  attachment: z.any().optional(),
});

const GalleryPage = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useGetGalleryQuery({ page, limit: 12 });
  const [createItem, { isLoading: isCreating }] = useCreateGalleryItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateGalleryItemMutation();
  const [deleteItem] = useDeleteGalleryItemMutation();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
      attachment: null
    }
  });

  const galleryImages = watch('images');
  const galleryAttachment = watch('attachment');

  const handleOpenCreate = () => {
    setEditingItem(null);
    reset({
      title: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
      attachment: null
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({
      title: item.title,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      images: item.images || [],
      attachment: item.attachment || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await deleteItem(id).unwrap();
        toast.success('Gallery item deleted');
      } catch (err) {
        toast.error('Failed to delete item');
      }
    }
  };

  const onSubmit = async (formData) => {
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('date', formData.date);

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(img => {
        if (img instanceof File) {
          payload.append('images', img);
        } else {
          payload.append('existingImages', img);
        }
      });
    }

    if (formData.attachment && formData.attachment instanceof File) {
      payload.append('attachment', formData.attachment);
    }

    try {
      if (editingItem) {
        await updateItem({ id: editingItem._id, formData: payload }).unwrap();
        toast.success('Gallery updated!');
      } else {
        await createItem(payload).unwrap();
        toast.success('Gallery item added!');
      }
      setShowModal(false);
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Preview',
      accessorKey: 'images',
      cell: info => {
        const images = info.getValue();
        return images?.[0] ? (
          <div style={{ width: '50px', height: '50px' }}>
            <img src={images[0]} alt="Preview" className="w-100 h-100 object-fit-cover rounded" />
          </div>
        ) : (
          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-image text-muted"></i>
          </div>
        );
      }
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: info => <span className="fw-bold">{info.getValue()}</span>
    },
    {
      header: 'Date',
      accessorKey: 'date',
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

  if (isLoading) return <Loader fullPage />;

  return (
    <div className="container-fluid content-page px-0">
      <div className="content-page-header">
        <div>
          <h2 className="content-page-title">Photo Gallery</h2>
          <p className="content-page-subtitle">Manage school memories in a clean visual archive.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg me-2"></i> Add Photos
        </Button>
      </div>

      <Table
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageCount={data?.pagination?.totalPages}
        emptyMessage="Upload photos of school festivals, sports days, and other events."
        emptyTitle="Gallery is empty"
        emptyAction={{ label: 'Upload Now', onClick: handleOpenCreate }}
      />

      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Title / Caption</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              {...register('title')}
            />
            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className={`form-control ${errors.date ? 'is-invalid' : ''}`}
              {...register('date')}
            />
            {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
          </div>

          <div className="mb-3">
             <FileUploader
                label="Attachment (PDF/Doc - Optional)"
                value={galleryAttachment}
                onChange={(file) => setValue('attachment', file)}
             />
          </div>

          <div className="mb-4">
            <label className="form-label">Upload Photos (Max 5)</label>
            <ImageUploader
              multiple
              value={galleryImages}
              onChange={(files) => setValue('images', files)}
            />
            {errors.images && <div className="text-danger small mt-1">{errors.images.message}</div>}
          </div>
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? <Loader size="sm" /> : (editingItem ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
};

export default GalleryPage;
