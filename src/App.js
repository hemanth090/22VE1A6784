import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import Navigation from './components/Navigation';
import URLShortener from './pages/URLShortener';
import Statistics from './pages/Statistics';
import RedirectHandler from './components/RedirectHandler';
import logger from './middleware/logger';

function App() {
  useEffect(() => {
    logger.info('Application started', { timestamp: new Date().toISOString() }, 'app');
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Navigation />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/shorten" replace />} />
          <Route path="/shorten" element={<URLShortener />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/:shortCode" element={<RedirectHandler />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;