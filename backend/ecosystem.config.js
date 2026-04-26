// PM2 ecosystem config for sufuf-api
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'sufuf-api',
      script: 'dist/main.js',
      cwd: '/home/sufuf/web/api.sufuf.pro/public_html',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      max_memory_restart: '500M',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
