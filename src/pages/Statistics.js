import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Link,
  Snackbar
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  ContentCopy, 
  Launch,
  Refresh 
} from '@mui/icons-material';
import logger from '../middleware/logger';
import { getStoredUrls } from '../utils/storage';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    logger.info('Loading URL statistics', null, 'component');
    setLoading(true);
    
    try {
      const storedUrls = getStoredUrls();
      setUrls(storedUrls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      logger.info(`Loaded statistics for ${storedUrls.length} URLs`, null, 'component');
    } catch (error) {
      logger.error('Failed to load statistics', error, 'handler');
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (urlId) => {
    setExpandedRows(prev => ({
      ...prev,
      [urlId]: !prev[urlId]
    }));
    logger.debug(`Toggled row expansion for URL ID: ${urlId}`, null, 'component');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      logger.info('URL copied to clipboard', { url: text }, 'component');
    });
  };

  const getShortUrl = (shortCode) => {
    return `${window.location.origin}/${shortCode}`;
  };

  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  const getStatusChip = (url) => {
    if (isExpired(url.expiryDate)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + (url.clickCount || 0), 0);
  };

  const getActiveUrls = () => {
    return urls.filter(url => !isExpired(url.expiryDate)).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          URL Statistics
        </Typography>
        <Tooltip title="Refresh statistics">
          <IconButton onClick={loadStatistics}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total URLs
              </Typography>
              <Typography variant="h4">
                {urls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active URLs
              </Typography>
              <Typography variant="h4" color="success.main">
                {getActiveUrls()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Clicks
              </Typography>
              <Typography variant="h4" color="primary">
                {getTotalClicks()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {urls.length === 0 ? (
        <Alert severity="info">
          No shortened URLs found. Create some URLs first using the URL Shortener page.
        </Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <React.Fragment key={url.id}>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Link 
                            href={getShortUrl(url.shortCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none' }}
                          >
                            /{url.shortCode}
                          </Link>
                          {url.customCode && (
                            <Chip label="Custom" size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(url)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {url.clickCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={isExpired(url.expiryDate) ? 'error' : 'text.primary'}
                        >
                          {formatDate(url.expiryDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Copy short URL">
                            <IconButton 
                              size="small"
                              onClick={() => copyToClipboard(getShortUrl(url.shortCode))}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open original URL">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(url.originalUrl, '_blank')}
                            >
                              <Launch fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {url.clicks && url.clicks.length > 0 && (
                            <Tooltip title="View click details">
                              <IconButton 
                                size="small"
                                onClick={() => toggleRowExpansion(url.id)}
                              >
                                {expandedRows[url.id] ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded row for click details */}
                    {url.clicks && url.clicks.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in={expandedRows[url.id]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                Click Details ({url.clicks.length} clicks)
                              </Typography>
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Timestamp</TableCell>
                                      <TableCell>Source</TableCell>
                                      <TableCell>Location</TableCell>
                                      <TableCell>User Agent</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {url.clicks.slice().reverse().map((click, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {formatDate(click.timestamp)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {click.source || 'Direct'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {click.location || 'Unknown'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              maxWidth: 200, 
                                              overflow: 'hidden', 
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {click.userAgent || 'Unknown'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="URL copied to clipboard!"
      />
    </Box>
  );
};

export default Statistics;