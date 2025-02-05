import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function clearTokenFiles() {
  const tokenPaths = [
    path.join(process.cwd(), 'token.json'),
    path.join(process.cwd(), '.credentials'),
    path.join(process.cwd(), 'google-credentials.json'),
    path.join(process.cwd(), '.google-token-cache')
  ];

  tokenPaths.forEach(tokenPath => {
    if (fs.existsSync(tokenPath)) {
      try {
        fs.unlinkSync(tokenPath);
        console.log(`Deleted token file: ${tokenPath}`);
      } catch (error) {
        console.error(`Error deleting ${tokenPath}:`, error);
      }
    }
  });
}

function validateEnvironmentVariables() {
  dotenv.config();

  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Log partial credentials to verify correct ones are being used
  console.log('Current Google Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 8) + '...');
}

function clearEnvironmentCache() {
  // Clear any cached credentials from process.env
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    delete process.env.GOOGLE_REFRESH_TOKEN;
    console.log('Cleared cached refresh token');
  }
}

// Execute cleanup
console.log('Starting Google authentication reset...');
clearTokenFiles();
clearEnvironmentCache();
validateEnvironmentVariables();
console.log('Google authentication reset complete. Please run generate-token script to re-authenticate.');

