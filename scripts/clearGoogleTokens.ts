import fs from 'fs';
import path from 'path';

// Function to clear token file if it exists
function clearTokenFile() {
  const tokenPaths = [
    path.join(process.cwd(), 'token.json'),
    path.join(process.cwd(), '.credentials'),
    path.join(process.cwd(), 'google-credentials.json')
  ];

  tokenPaths.forEach(tokenPath => {
    if (fs.existsSync(tokenPath)) {
      try {
        fs.unlinkSync(tokenPath);
        console.log(`Deleted: ${tokenPath}`);
      } catch (error) {
        console.error(`Error deleting ${tokenPath}:`, error);
      }
    }
  });
}

// Clear any existing tokens
clearTokenFile();
console.log('Google credentials cleared successfully');

