import React from 'react';
import './AppHeader.css';

export const AppHeader: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo">
          <h1>Sketchbook</h1>
        </div>
        <nav className="header-nav">
          <a href="/" className="nav-link">Collections</a>
        </nav>
      </div>
    </header>
  );
};
