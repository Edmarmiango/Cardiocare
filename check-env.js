const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log("Current working directory:", process.cwd());
console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in the .env file");
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log(".env file exists at:", envPath);
    console.log("Contents of .env file:");
    const envContents = fs.readFileSync(envPath, 'utf8');
    console.log(envContents);
  } else {
    console.error(".env file does not exist at:", envPath);
  }
} else {
  console.log("DATABASE_URL is correctly set");
}

