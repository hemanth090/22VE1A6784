import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { Add, Delete, ContentCopy } from '@mui/icons-material';
import logger from '../middleware/logger';
import { 
  addShortenedUrl, 
  generateShortCode, 
  isValidUrl, 
  calculateExpiryDate 
} from '../utils/storage';

const URLShortener = () => {
  const [urlForms, setUrlForms] = useState([
    { id: 1, originalUrl: '', customCode: '', validity: 30 }
  ]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const addUrlForm = () => {
    if (urlForms.length < 5) {
      const newId = Math.max(...urlForms.map(f => f.id)) + 1;
      setUrlForms([...urlForms, { id: newId, originalUrl: '', customCode: '', validity: 30 }]);
      logger.info('Added new URL form', { formCount: urlForms.length + 1 }, 'component');
    }
  };

  const removeUrlForm = (id) => {
    if (urlForms.length > 1) {
      setUrlForms(urlForms.filter(form => form.id !== id));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      logger.info('Removed URL form', { formId: id, remainingForms: urlForms.length - 1 }, 'component');
    }
  };

  const updateUrlForm = (id, field, value) => {
    setUrlForms(urlForms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
    
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: null }
      }));
    }
  };

  const validateForm = (form) => {
    const formErrors = {};
    
    if (!form.originalUrl.trim()) {
      formErrors.originalUrl = 'URL is required';
    } else if (!isValidUrl(form.originalUrl)) {
      formErrors.originalUrl = 'Please enter a valid URL (must include http:// or https://)';
    }
    
    if (form.validity && (isNaN(form.validity) || form.validity < 1 || form.validity > 10080)) {
      formErrors.validity = 'Validity must be between 1 and 10080 minutes (1 week)';
    }
    
    if (form.customCode && !/^[a-zA-Z0-9]{3,10}$/.test(form.customCode)) {
      formErrors.customCode = 'Custom code must be 3-10 alphanumeric characters';
    }
    
    return formErrors;
  };

  const validateAllForms = () => {
    const allErrors = {};
    let hasErrors = false;
    
    urlForms.forEach(form => {
      if (form.originalUrl.trim()) { // Only validate forms with URLs
        const formErrors = validateForm(form);
        if (Object.keys(formErrors).length > 0) {
          allErrors[form.id] = formErrors;
          hasErrors = true;
        }
      }
    });
    
    setErrors(allErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    logger.info('URL shortening process started', { formCount: urlForms.length }, 'component');
    
    if (!validateAllForms()) {
      logger.warn('Form validation failed', null, 'component');
      return;
    }
    
    setLoading(true);
    const newResults = [];
    const processedForms = urlForms.filter(form => form.originalUrl.trim());
    
    if (processedForms.length === 0) {
      setErrors({ general: 'Please enter at least one URL to shorten' });
      setLoading(false);
      return;
    }
    
    try {
      for (const form of processedForms) {
        try {
          const shortCode = generateShortCode(form.customCode || null);
          const expiryDate = calculateExpiryDate(form.validity || 30);
          
          const urlData = {
            id: Date.now() + Math.random(),
            originalUrl: form.originalUrl,
            shortCode,
            customCode: form.customCode || null,
            validity: form.validity || 30,
            expiryDate,
            createdAt: new Date().toISOString(),
            clicks: [],
            clickCount: 0
          };
          
          addShortenedUrl(urlData);
          newResults.push(urlData);
          
          logger.info('URL shortened successfully', {
            originalUrl: form.originalUrl,
            shortCode,
            expiryDate
          }, 'component');
          
        } catch (error) {
          logger.error('Failed to shorten individual URL', {
            originalUrl: form.originalUrl,
            error: error.message
          }, 'handler');
          
          setErrors(prev => ({
            ...prev,
            [form.id]: { customCode: error.message }
          }));
        }
      }
      
      setResults(newResults);
      
      if (newResults.length > 0) {
        // Reset forms after successful submission
        setUrlForms([{ id: 1, originalUrl: '', customCode: '', validity: 30 }]);
      }
      
    } catch (error) {
      logger.error('URL shortening process failed', error, 'handler');
      setErrors({ general: 'Failed to process URLs. Please try again.' });
    } finally {
      setLoading(false);
    }
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Shorten up to 5 URLs simultaneously with custom codes and expiry times.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {urlForms.map((form, index) => (
          <Box key={form.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">URL #{index + 1}</Typography>
              {urlForms.length > 1 && (
                <IconButton 
                  onClick={() => removeUrlForm(form.id)}
                  color="error"
                  sx={{ ml: 1 }}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Original URL"
                  placeholder="https://example.com/very-long-url"
                  value={form.originalUrl}
                  onChange={(e) => updateUrlForm(form.id, 'originalUrl', e.target.value)}
                  error={!!errors[form.id]?.originalUrl}
                  helperText={errors[form.id]?.originalUrl}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custom Short Code (Optional)"
                  placeholder="mycode123"
                  value={form.customCode}
                  onChange={(e) => updateUrlForm(form.id, 'customCode', e.target.value)}
                  error={!!errors[form.id]?.customCode}
                  helperText={errors[form.id]?.customCode || "3-10 alphanumeric characters"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Validity (Minutes)"
                  value={form.validity}
                  onChange={(e) => updateUrlForm(form.id, 'validity', parseInt(e.target.value) || 30)}
                  error={!!errors[form.id]?.validity}
                  helperText={errors[form.id]?.validity || "Default: 30 minutes"}
                  inputProps={{ min: 1, max: 10080 }}
                />
              </Grid>
            </Grid>
            
            {index < urlForms.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          {urlForms.length < 5 && (
            <Button
              startIcon={<Add />}
              onClick={addUrlForm}
              variant="outlined"
            >
              Add Another URL
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ ml: 'auto' }}
          >
            {loading ? 'Processing...' : 'Shorten URLs'}
          </Button>
        </Box>
        
        {errors.general && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.general}
          </Alert>
        )}
      </Paper>
      
      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Shortened URLs
          </Typography>
          
          {results.map((result) => (
            <Box key={result.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Original: {result.originalUrl}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" color="primary">
                  {getShortUrl(result.shortCode)}
                </Typography>
                <Tooltip title="Copy to clipboard">
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(getShortUrl(result.shortCode))}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Expires: ${new Date(result.expiryDate).toLocaleString()}`} 
                  size="small" 
                  color="secondary"
                />
                {result.customCode && (
                  <Chip 
                    label="Custom Code" 
                    size="small" 
                    color="primary"
                  />
                )}
              </Box>
            </Box>
          ))}
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

export default URLShortener;