import React from 'react';
import { AppHeader } from './AppHeader';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  );
};
