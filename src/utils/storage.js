import logger from '../middleware/logger';

const STORAGE_KEY = 'shortened_urls';

export const getStoredUrls = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const urls = stored ? JSON.parse(stored) : [];
    logger.debug(`Retrieved ${urls.length} URLs from storage`, null, 'utils');
    return urls;
  } catch (error) {
    logger.error('Failed to retrieve URLs from storage', error, 'utils');
    return [];
  }
};

export const saveUrls = (urls) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    logger.debug(`Saved ${urls.length} URLs to storage`, null, 'utils');
  } catch (error) {
    logger.error('Failed to save URLs to storage', error, 'utils');
    throw new Error('Failed to save data');
  }
};

export const addShortenedUrl = (urlData) => {
  try {
    const existingUrls = getStoredUrls();
    const newUrls = [...existingUrls, urlData];
    saveUrls(newUrls);
    logger.info('New shortened URL added', { 
      shortCode: urlData.shortCode,
      originalUrl: urlData.originalUrl 
    }, 'utils');
    return urlData;
  } catch (error) {
    logger.error('Failed to add shortened URL', error, 'utils');
    throw error;
  }
};

export const updateClickStats = (shortCode, clickData) => {
  try {
    const urls = getStoredUrls();
    const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
    
    if (urlIndex !== -1) {
      if (!urls[urlIndex].clicks) {
        urls[urlIndex].clicks = [];
      }
      urls[urlIndex].clicks.push(clickData);
      urls[urlIndex].clickCount = urls[urlIndex].clicks.length;
      saveUrls(urls);
      
      logger.info(`Click recorded for shortcode: ${shortCode}`, clickData, 'utils');
    }
  } catch (error) {
    logger.error('Failed to update click stats', error, 'utils');
  }
};

export const generateShortCode = (customCode = null) => {
  if (customCode) {
    // Validate custom code
    if (!/^[a-zA-Z0-9]{3,10}$/.test(customCode)) {
      throw new Error('Custom shortcode must be 3-10 alphanumeric characters');
    }
    
    // Check if custom code already exists
    const existingUrls = getStoredUrls();
    if (existingUrls.some(url => url.shortCode === customCode)) {
      throw new Error('Custom shortcode already exists');
    }
    
    logger.info(`Using custom shortcode: ${customCode}`, null, 'utils');
    return customCode;
  }
  
  // Generate random shortcode
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  const existingUrls = getStoredUrls();
  const existingCodes = existingUrls.map(url => url.shortCode);
  
  // Generate unique code
  do {
    result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (existingCodes.includes(result));
  
  logger.info(`Generated shortcode: ${result}`, null, 'utils');
  return result;
};

export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const calculateExpiryDate = (validityMinutes = 30) => {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + validityMinutes * 60000);
  return expiryDate.toISOString();
};