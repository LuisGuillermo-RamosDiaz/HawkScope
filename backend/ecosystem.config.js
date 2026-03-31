const fs = require('fs');
const path = require('path');

// Read the .env file from the current directory
const envPath = path.resolve(__dirname, '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key) envConfig[key] = value;
    }
  });
}

module.exports = {
  apps: [
    {
      name: "hawkscope-api",
      script: "java",
      args: "-jar backend-0.0.1-SNAPSHOT.jar",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        ...envConfig,
        NODE_ENV: "production"
      }
    }
  ]
};
