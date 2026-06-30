import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';

export default function ProjectListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const limit = 9;

  const { data, isLoading, isError } = useProjects(page, limit);
  const projects = data?.projects ?? [];
  const pagination = data?.pagination;

  const filtered = search
    ? projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.student?.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setDraftSearch('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Projects Showcase</h1>
          <p className="page-subtitle">
            {pagination?.total != null ? `${pagination.total} projects from student innovators` : 'Discover student innovation'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="project-search-form">
        <div className="project-search-wrap">
          <Search size={16} className="project-search-icon" />
          <input
            className="project-search-input"
            placeholder="Search projects by title, description, or author…"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
          />
          {draftSearch && (
            <button type="button" className="project-search-clear" onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn--primary btn--sm">
          <Search size={14} />
          <span>Search</span>
        </button>
      </form>

      {/* Active filter pill */}
      {search && (
        <div className="project-filter-row">
          <span className="project-filter-chip">
            <SlidersHorizontal size={12} />
            <span>"{search}"</span>
            <button onClick={clearSearch}><X size={11} /></button>
          </span>
          <span className="project-filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {isLoading ? (
        <div className="page-spinner"><div className="spinner" /></div>
      ) : isError ? (
        <div className="page-center"><p className="empty-state">Failed to load projects. Please try again.</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-box">
          <Search size={40} strokeWidth={1.5} />
          <h3>{search ? `No results for "${search}"` : 'No projects yet'}</h3>
          <p>{search ? 'Try a different search term.' : 'Be the first to showcase your project!'}</p>
          {search && (
            <button className="btn btn--secondary btn--sm" onClick={clearSearch}>Clear search</button>
          )}
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {!search && pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="pagination-pages">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-page ${pageNum === page ? 'pagination-page--active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
