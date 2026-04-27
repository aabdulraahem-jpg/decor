module.exports = {
  apps: [{
    name: 'sufuf-admin',
    script: './.next/standalone/server.js',
    cwd: '/home/sufuf/sufuf/admin',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
      HOSTNAME: '127.0.0.1',
      NEXT_PUBLIC_API_URL: 'https://api.sufuf.pro/api/v1'
    },
    max_memory_restart: '500M'
  }]
};
