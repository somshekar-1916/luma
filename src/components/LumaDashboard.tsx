import React from 'react';
import { Dashboard } from './Dashboard';

interface LumaDashboardProps {
  user?: any;
  onLogout: () => void;
}

export const LumaDashboard: React.FC<LumaDashboardProps> = ({ onLogout }) => {
  return <Dashboard onLogout={onLogout} />;
};

export default LumaDashboard;
