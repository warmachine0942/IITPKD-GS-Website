import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects.css';

const projectId = (project) => String(project._id || project.id || project.projectName);

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/projects')
      .then(({ data }) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load projects. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="projects-container page-transition">
      <div className="projects-header">
        <h1 className="projects-title">Our Projects</h1>
        <p className="projects-subtitle">
          Explore the rockets, experiments, and engineering work underway at Mach-V.
        </p>
      </div>

      {loading && <p className="projects-subtitle" role="status">Loading projects...</p>}
      {error && <p className="projects-subtitle" role="alert">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="projects-subtitle">Project details will appear here soon.</p>
      )}

      <div className="projects-grid">
        {projects.map((project) => {
          const id = projectId(project);
          return (
            <article key={id} className="project-card">
              <p className="project-type">{project.projectType || 'Mach-V Project'}</p>
              <h2 className="project-card-title">{project.projectName || 'Untitled project'}</h2>
              <p className="project-card-desc">
                {project.projectDescription || project.description || 'Project details coming soon.'}
              </p>
              <button className="project-card-link" onClick={() => navigate(`/projects/${encodeURIComponent(id)}`)}>
                Learn More →
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
