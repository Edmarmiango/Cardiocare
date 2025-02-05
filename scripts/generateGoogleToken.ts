import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const exec = promisify(execCallback);

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

async function openBrowser(url: string) {
  console.log('Opening URL:', url);
  
  try {
    switch (process.platform) {
      case 'win32':
        await exec(`start "" "${url}"`);
        break;
      case 'darwin':
        await exec(`open "${url}"`);
        break;
      default:
        await exec(`xdg-open "${url}"`);
    }
  } catch (error) {
    console.log('Failed to open browser automatically.');
    console.log('Please manually copy and paste this URL into your browser:');
    console.log('\n', url, '\n');
  }
}

async function main() {
  try {
    // Define a single scope string instead of an array
    const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

    // Generate authentication URL with proper parameters
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scope, // Pass single scope string
      prompt: 'consent' // Force consent screen to get refresh token
    });

    console.log('Starting authentication server...');

    const server = http.createServer(async (req, res) => {
      try {
        if (!req.url) {
          throw new Error('No URL in request');
        }

        if (req.url.startsWith('/oauth2callback')) {
          // Parse the callback URL
          const urlParts = new url.URL(req.url, `http://localhost:3000`);
          const code = urlParts.searchParams.get('code');
          const error = urlParts.searchParams.get('error');

          if (error) {
            throw new Error(`Authentication error: ${error}`);
          }

          if (!code) {
            throw new Error('No authorization code received');
          }

          // Exchange code for tokens
          console.log('Exchanging authorization code for tokens...');
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);

          // Display the tokens
          console.log('\nAuthentication successful! Here are your tokens:\n');
          console.log('Access Token:', tokens.access_token);
          console.log('Refresh Token:', tokens.refresh_token);
          console.log('\nAdd these to your environment variables:\n');
          console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

          // Send success response
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
                <h1 style="color: #4CAF50;">Authentication Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <p>Please save your refresh token from the terminal.</p>
              </body>
            </html>
          `);

          // Close server and exit
          server.close(() => {
            console.log('Server closed');
            process.exit(0);
          });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
              <h1 style="color: #f44336;">Authentication Failed</h1>
              <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `);
        process.exit(1);
      }
    });

    // Start server
    server.listen(3000, async () => {
      console.log('\nAuthentication server running at http://localhost:3000');
      console.log('Attempting to open browser for authentication...');
      await openBrowser(authorizeUrl);
    });

    // Set timeout
    setTimeout(() => {
      console.log('Authentication timeout reached (60 seconds)');
      server.close(() => {
        console.log('Server closed');
        process.exit(1);
      });
    }, 60000);

  } catch (error) {
    console.error('Error during authentication:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

