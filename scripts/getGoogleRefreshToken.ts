import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import url from 'url';

(async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  console.log('Please open the following URL in your browser:');
  console.log(authUrl);

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith('/oauth2callback')) {
      const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
      const code = qs.get('code');
      res.end('Authentication successful! You can close this window and return to the console.');
      server.close();

      try {
        const { tokens } = await oauth2Client.getToken(code as string);
        console.log('Refresh Token:', tokens.refresh_token);
      } catch (error) {
        console.error('Error getting tokens:', error);
      }
      process.exit(0);
    }
  }).listen(3000, () => {
    console.log('Waiting for authentication...');
  });
})();



