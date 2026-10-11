import React from 'react';
import { useNavigate } from 'react-router-dom';
import { subsystems } from '../data/subsystemsData';
import '../styles/Subsystems.css';

export default function Subsystems() {
  const navigate = useNavigate();

  return (
    <div className="subsystems-container page-transition">
      <div className="subsystems-header">
        <h1 className="subsystems-title">Our Subsystems</h1>
        <p className="subsystems-subtitle">
          Building a rocket requires seamless collaboration across multiple engineering
          disciplines. Discover the teams that make our launches possible.
        </p>
      </div>

      <div className="subsystems-grid">
        {subsystems.map((sub) => (
          <button
            key={sub.id} 
            className="subsystem-card"
            onClick={() => navigate(`/subsystems/${sub.id}`)}
            type="button"
            aria-label={`Explore ${sub.title} subsystem`}
          >
            <span className="subsystem-icon" aria-hidden="true">
              {sub.icon}
            </span>
            <span className="subsystem-card-title">{sub.title}</span>
            <p className="subsystem-card-desc">{sub.desc}</p>
            <span className="subsystem-card-link" aria-hidden="true">Explore subsystem <span>↗</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}
