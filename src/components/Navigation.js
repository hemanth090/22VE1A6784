import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import logger from '../middleware/logger';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, label) => {
    logger.info(`Navigation: User navigated to ${label}`, { path, from: location.pathname }, 'component');
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button 
        color="inherit" 
        onClick={() => handleNavigation('/shorten', 'URL Shortener')}
        variant={location.pathname === '/shorten' ? 'outlined' : 'text'}
      >
        Shorten URLs
      </Button>
      <Button 
        color="inherit" 
        onClick={() => handleNavigation('/statistics', 'Statistics')}
        variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
      >
        Statistics
      </Button>
    </Box>
  );
};

export default Navigation;