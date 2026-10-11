import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios.get(`/projects/${encodeURIComponent(id)}`)
      .then(({ data }) => { if (!cancelled) setProject(data); })
      .catch(() => { if (!cancelled) setProject(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="project-detail-wrapper"><div className="project-detail-container">Loading project...</div></div>;
  }

  if (!project) {
    return (
      <div className="project-detail-wrapper">
        <div className="project-detail-container project-detail-error">
          <h2>Project not found</h2>
          <button className="back-button" onClick={() => navigate('/projects')}>← Back to Projects</button>
        </div>
      </div>
    );
  }

  const links = Array.isArray(project.projectLinks) ? project.projectLinks : [];
  const detail = project.projectData;

  return (
    <div className="project-detail-wrapper page-transition">
      <div className="project-detail-container">
        <button className="back-button" onClick={() => navigate('/projects')}>← Back</button>
        <div className="project-detail-header">
          <div className="project-detail-header-text">
            <p className="project-type">{project.projectType || 'Mach-V Project'}</p>
            <h1 className="project-detail-title">{project.projectName || 'Untitled project'}</h1>
          </div>
        </div>
        <div className="project-detail-content">
          <section className="project-section">
            <h3>About This Project</h3>
            <p>{project.projectDescription || project.description || 'More details coming soon.'}</p>
          </section>
          {detail && (
            <section className="project-section">
              <h3>Project Details</h3>
              <dl className="project-data-list">
                {Object.entries(detail)
                  .filter(([key, value]) => key !== '_id' && key !== 'projectName' && value != null)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</dt>
                      <dd>{typeof value === 'object' ? JSON.stringify(value, null, 0) : String(value)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          )}
          {links.length > 0 && (
            <section className="project-section">
              <h3>Project Links</h3>
              <ul className="project-objectives-list">
                {links.map((link, index) => (
                  <li key={`${link}-${index}`}>
                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
