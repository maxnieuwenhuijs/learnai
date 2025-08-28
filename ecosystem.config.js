module.exports = {
  apps: [
    {
      name: 'backend-server',
      script: './server/src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
    NODE_ENV: "production",
      DB_HOST: "localhost",
      DB_USER: "learnai_app",
      DB_PASSWORD: "BoomBoom10!Baby",
      DB_NAME: "db",
	FRONTEND_URL: "http://209.38.40.156",
JWT_SECRET:"your-super-secret-jwt-key",
JWT_EXPIRE:"7d",
SESSION_SECRET:"your-session-secret"
      },
      error_file: './logs/pm2-backend-error.log',
      out_file: './logs/pm2-backend-out.log',
      log_file: './logs/pm2-backend-combined.log',
      time: true
    }
  ]
};
