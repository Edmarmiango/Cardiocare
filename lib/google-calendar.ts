import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Validate environment variables at runtime
function validateGoogleCredentials() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing required Google Calendar API credentials. Please check your environment variables.');
  }
  
  // Log partial ID to verify correct credentials are being used
  console.log('Using Google Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 8) + '...');
}

// Create OAuth2 client with runtime validation
function createOAuth2Client() {
  validateGoogleCredentials();
  
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth2callback'
  });
}

// Initialize OAuth2 client
const oauth2Client = createOAuth2Client();

// Set refresh token if available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

// Create calendar instance
export const calendar = google.calendar({ 
  version: 'v3', 
  auth: oauth2Client 
});

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    console.log('Access token refreshed successfully');
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token. Please re-authenticate.');
  }
}

// Wrapper function to handle token refresh and authentication errors
export async function executeWithTokenRefresh(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Google Calendar API Error:', error);

    if (error.message.includes('deleted_client')) {
      throw new Error('OAuth client configuration is invalid. Please check your Google Cloud Console credentials.');
    }

    if (error.message === 'invalid_grant' || error.status === 401) {
      console.log('Token expired or invalid, attempting to refresh...');
      await refreshAccessToken();
      return await operation();
    }

    throw error;
  }
}

