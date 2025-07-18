# URL Shortener Application

A modern, feature-rich URL shortener built with React and Material-UI that allows users to create shortened URLs with custom codes, expiry dates, and comprehensive analytics.

## Features

### Core Functionality
- **Multi-URL Shortening**: Shorten up to 5 URLs simultaneously
- **Custom Short Codes**: Create personalized short codes (3-10 alphanumeric characters)
- **Expiry Management**: Set custom expiry times (1 minute to 1 week)
- **Click Tracking**: Detailed analytics with timestamp, source, and user agent data
- **Real-time Statistics**: Comprehensive dashboard with click counts and URL status

### Technical Features
- **Advanced Logging**: Custom middleware with multiple log levels (INFO, WARN, ERROR, DEBUG)
- **Local Storage**: Persistent data storage in browser
- **Responsive Design**: Mobile-friendly Material-UI interface
- **Error Handling**: Comprehensive validation and error management
- **URL Validation**: Proper URL format checking with protocol validation

## Technology Stack

- **Frontend**: React 18.2.0
- **UI Framework**: Material-UI (MUI) 5.15.0
- **Routing**: React Router DOM 6.20.0
- **Icons**: Material-UI Icons
- **Styling**: Emotion (CSS-in-JS)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Creating Short URLs
1. Navigate to the "Shorten URLs" page
2. Enter the original URL (must include http:// or https://)
3. Optionally set a custom short code
4. Set expiry time in minutes (default: 30 minutes)
5. Click "Shorten URLs" to generate the short link

### Viewing Statistics
1. Navigate to the "Statistics" page
2. View summary cards showing total URLs, active URLs, and total clicks
3. Expand individual URLs to see detailed click analytics
4. Copy short URLs or open original URLs directly from the table

### Using Short URLs
- Short URLs follow the format: `http://localhost:3000/{shortCode}`
- Clicking a short URL redirects to the original URL
- Each click is tracked with timestamp and metadata
- Expired URLs show an error message instead of redirecting

## Project Structure

```
src/
├── components/
│   ├── Navigation.js          # Navigation bar component
│   └── RedirectHandler.js     # Handles short URL redirects
├── middleware/
│   └── logger.js             # Custom logging middleware
├── pages/
│   ├── Statistics.js         # Analytics and statistics page
│   └── URLShortener.js       # Main URL shortening interface
├── utils/
│   └── storage.js            # Local storage utilities
├── App.js                    # Main application component
└── index.js                  # Application entry point
```

## Features in Detail

### Logging System
- **Multiple Log Levels**: INFO, WARN, ERROR, DEBUG
- **Persistent Storage**: Logs stored in localStorage
- **Memory Management**: Automatic cleanup to prevent memory issues
- **Contextual Logging**: Each log entry includes timestamp and relevant data

### URL Management
- **Validation**: Comprehensive URL format validation
- **Uniqueness**: Automatic generation of unique short codes
- **Custom Codes**: Support for user-defined short codes
- **Expiry Handling**: Automatic expiry checking and enforcement

### Analytics
- **Click Tracking**: Detailed click information including:
  - Timestamp
  - Referrer source
  - User agent
  - Geographic location (placeholder)
- **Statistics Dashboard**: Visual representation of URL performance
- **Export Capabilities**: Easy access to raw data

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- Backend API integration
- User authentication
- Database storage
- Advanced analytics
- QR code generation
- Bulk URL import/export
- Custom domains
- API rate limiting
- Real-time notifications