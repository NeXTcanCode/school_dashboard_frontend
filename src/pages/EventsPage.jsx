import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation
} from '../features/events/eventsApi';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ModalWrapper from '../components/common/ModalWrapper';
import ImageUploader from '../components/common/ImageUploader';
import FileUploader from '../components/common/FileUploader';
import Table from '../components/common/Table';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fromDate: z.string().min(1, 'From Date is required'),
  toDate: z.string().min(1, 'To Date is required'),
  location: z.string().optional(),
  images: z.array(z.any()).optional(),
  existingImages: z.array(z.string()).optional(),
  attachment: z.any().optional(),
});

const EventsPage = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useGetEventsQuery({ page, limit: 10 });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      location: '',
      images: [],
      attachment: null
    }
  });

  const eventImages = watch('images');
  const eventAttachment = watch('attachment');

  const handleOpenCreate = () => {
    setEditingItem(null);
    reset({
      title: '',
      description: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      location: '',
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
      location: item.location || '',
      images: item.images || [],
      existingImages: item.images || [], // Pre-fill existing images for validation/logic if needed, though usually handled by ImageUploader via value prop logic
      attachment: item.attachment || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id).unwrap();
        toast.success('Event deleted');
      } catch (err) {
        toast.error('Failed to delete event');
      }
    }
  };

  const onSubmit = async (data) => {
    const payload = new FormData();
    payload.append('title', data.title);
    payload.append('description', data.description);
    payload.append('fromDate', data.fromDate);
    payload.append('toDate', data.toDate);
    if (data.location) payload.append('location', data.location);

    if (data.images && data.images.length > 0) {
      data.images.forEach(img => {
        if (img instanceof File) {
          payload.append('images', img);
        } else {
          payload.append('existingImages', img);
        }
      });
    }

    if (data.attachment && data.attachment instanceof File) {
      payload.append('attachment', data.attachment);
    }

    try {
      if (editingItem) {
        await updateEvent({ id: editingItem._id, formData: payload }).unwrap();
        toast.success('Event updated successfully!');
      } else {
        await createEvent(payload).unwrap();
        toast.success('Event created successfully!');
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
            <i className="bi bi-calendar-event text-muted"></i>
          </div>
        );
      }
    },
    {
      header: 'Event Title',
      accessorKey: 'title',
      cell: info => <span className="fw-bold">{info.getValue()}</span>
    },
    {
      header: 'Date',
      accessorKey: 'fromDate',
      cell: info => {
        const from = new Date(info.getValue()).toLocaleDateString();
        const to = new Date(info.row.original.toDate).toLocaleDateString();
        return `${from} - ${to}`;
      }
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: info => info.getValue() || '-'
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: info => (
        <div className="text-truncate" style={{ maxWidth: '250px' }} title={info.getValue()}>
          {info.getValue()}
        </div>
      )
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
          <h2 className="content-page-title">Events Calendar</h2>
          <p className="content-page-subtitle">Publish upcoming activities with a clear timeline.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg me-2"></i> Add Event
        </Button>
      </div>

      <Table
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        pageCount={data?.pagination?.totalPages}
        emptyMessage="Keep your school community updated by scheduling upcoming events."
        emptyTitle="No events scheduled"
        emptyAction={{ label: 'Add Event', onClick: handleOpenCreate }}
      />

      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editingItem ? 'Edit Event' : 'Add Event'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              {...register('title')}
            />
            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
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

          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className={`form-control ${errors.location ? 'is-invalid' : ''}`}
              {...register('location')}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="4"
              {...register('description')}
            />
            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
          </div>

           <div className="mb-3">
            <label className="form-label">Images (Max 5)</label>
            <ImageUploader
              multiple
              value={eventImages}
              onChange={(files) => setValue('images', files)}
            />
          </div>

          <div className="mb-3">
             <FileUploader
                label="Event Schedule/Flyer (PDF/Doc)"
                value={eventAttachment}
                onChange={(file) => setValue('attachment', file)}
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
export default EventsPage;
