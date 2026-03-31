module.exports = {
  apps: [
    {
      name: "hawkscope-api",
      script: "java",
      args: "-jar target/backend-0.0.1-SNAPSHOT.jar",
      cwd: "./", // Backend directory
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "development",
        PORT: 8080
      },
      env_production: {
        NODE_ENV: "production",
        // AWS production env variables should be loaded either here dynamically or via a local .env file
        PORT: 80
      }
    }
  ]
};
