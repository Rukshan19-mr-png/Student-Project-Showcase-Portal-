import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProjectFormModal({ project = null, onClose }) {
  const isEdit = !!project;
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [repositoryUrl, setRepositoryUrl] = useState(project?.repositoryUrl ?? '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    project?.thumbnailUrl
      ? `${import.meta.env.VITE_API_URL}${project.thumbnailUrl}`
      : null
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim() || title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (title.trim().length > 100) e.title = 'Title cannot exceed 100 characters';
    if (!description.trim() || description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (repositoryUrl && !/^https?:\/\/.+/.test(repositoryUrl)) e.repositoryUrl = 'Must be a valid URL';
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) e.file = 'Only JPEG, PNG, GIF, WebP images are allowed';
      if (file.size > MAX_SIZE) e.file = 'Image must be under 5MB';
    }
    if (!isEdit && !file && !preview) e.file = 'Thumbnail is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErrors((prev) => ({ ...prev, file: 'Only JPEG, PNG, GIF, WebP images are allowed' }));
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'Image must be under 5MB' }));
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('repositoryUrl', repositoryUrl.trim());
      if (file) formData.append('thumbnail', file);

      if (isEdit) {
        const { data } = await api.put(`/projects/${project.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      } else {
        const { data } = await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does..."
              rows={4}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="project-repo">Repository URL (optional)</label>
            <input
              id="project-repo"
              type="text"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
              className={errors.repositoryUrl ? 'input-error' : ''}
            />
            {errors.repositoryUrl && <span className="form-error">{errors.repositoryUrl}</span>}
          </div>

          <div className="form-group">
            <label>Thumbnail</label>
            <div
              className={`file-drop-zone ${errors.file ? 'input-error' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="file-preview" />
              ) : (
                <div className="file-drop-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span>Click to upload image</span>
                  <span className="file-drop-hint">JPEG, PNG, GIF, WebP · Max 5MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {errors.file && <span className="form-error">{errors.file}</span>}
          </div>

          {mutation.isError && (
            <div className="form-error-banner">
              {mutation.error?.response?.data?.error || mutation.error?.response?.data?.details?.[0]?.message || 'Something went wrong'}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
