import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import logger from '../middleware/logger';
import { getStoredUrls, updateClickStats } from '../utils/storage';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCoarseLocation = () => {
    // Get coarse geographical location based on timezone and language
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || navigator.userLanguage;
    
    // Simple mapping based on timezone (coarse-grained as required)
    const locationMap = {
      'America/New_York': 'North America (Eastern)',
      'America/Chicago': 'North America (Central)',
      'America/Denver': 'North America (Mountain)',
      'America/Los_Angeles': 'North America (Pacific)',
      'Europe/London': 'Europe (Western)',
      'Europe/Paris': 'Europe (Central)',
      'Europe/Berlin': 'Europe (Central)',
      'Asia/Tokyo': 'Asia (East)',
      'Asia/Shanghai': 'Asia (East)',
      'Asia/Kolkata': 'Asia (South)',
      'Australia/Sydney': 'Australia/Oceania'
    };
    
    const location = locationMap[timezone] || `${timezone.split('/')[0]} Region`;
    return `${location} (${language})`;
  };

  useEffect(() => {
    const handleRedirect = () => {
      logger.info(`Redirect attempt for shortcode: ${shortCode}`, null, 'component');
      
      const storedUrls = getStoredUrls();
      const urlData = storedUrls.find(url => url.shortCode === shortCode);
      
      if (!urlData) {
        logger.warn(`Shortcode not found: ${shortCode}`, null, 'handler');
        setError('Short URL not found');
        setLoading(false);
        return;
      }
      
      // Check if URL has expired
      const now = new Date();
      const expiryDate = new Date(urlData.expiryDate);
      
      if (now > expiryDate) {
        logger.warn(`Expired shortcode accessed: ${shortCode}`, { 
          expiryDate: urlData.expiryDate,
          currentTime: now.toISOString()
        }, 'handler');
        setError('This short URL has expired');
        setLoading(false);
        return;
      }
      
      // Update click statistics
      const clickData = {
        timestamp: now.toISOString(),
        source: document.referrer || 'Direct',
        userAgent: navigator.userAgent,
        // Simulated geographical data based on timezone and language
        location: getCoarseLocation()
      };
      
      updateClickStats(shortCode, clickData);
      
      logger.info(`Successful redirect for shortcode: ${shortCode}`, {
        originalUrl: urlData.originalUrl,
        clickData
      }, 'component');
      
      // Redirect to original URL
      window.location.href = urlData.originalUrl;
    };

    // Small delay to show loading state
    const timer = setTimeout(handleRedirect, 500);
    
    return () => clearTimeout(timer);
  }, [shortCode]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Redirecting...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">{error}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            The short URL "/{shortCode}" is either invalid or has expired.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return null;
};

export default RedirectHandler;