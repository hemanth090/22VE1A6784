// Custom Logging Middleware - Required for the application
class Logger {
  constructor() {
    this.logs = [];
    this.logLevel = {
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
      DEBUG: 'debug',
      FATAL: 'fatal'
    };
    this.apiEndpoint = 'http://20.244.56.144/evaluation-service/logs';
  }

  async log(level, message, data = null, packageName = 'frontend') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      id: Date.now() + Math.random()
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Store logs in localStorage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(-100)));
    } catch (e) {
      // Handle localStorage quota exceeded
    }

    // Send log to external API
    await this.sendLogToAPI(level, packageName, message);
  }

  async sendLogToAPI(level, packageName, message) {
    try {
      const requestBody = {
        stack: 'frontend',
        level: level.toLowerCase(),
        package: packageName,
        message: message
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Log sent successfully:', result);
      } else {
        console.error('Failed to send log:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to API:', error);
    }
  }

  async info(message, data, packageName = 'component') {
    await this.log(this.logLevel.INFO, message, data, packageName);
  }

  async warn(message, data, packageName = 'component') {
    await this.log(this.logLevel.WARN, message, data, packageName);
  }

  async error(message, data, packageName = 'handler') {
    await this.log(this.logLevel.ERROR, message, data, packageName);
  }

  async debug(message, data, packageName = 'component') {
    await this.log(this.logLevel.DEBUG, message, data, packageName);
  }

  async fatal(message, data, packageName = 'handler') {
    await this.log(this.logLevel.FATAL, message, data, packageName);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }
}

// Create singleton instance
const logger = new Logger();

// Load existing logs from localStorage on initialization
try {
  const storedLogs = localStorage.getItem('app_logs');
  if (storedLogs) {
    logger.logs = JSON.parse(storedLogs);
  }
} catch (e) {
  logger.error('Failed to load logs from localStorage', e, 'middleware');
}

export default logger;