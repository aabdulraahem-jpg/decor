module.exports = {
  apps: [{
    name: 'sufuf-api',
    script: './dist/main.js',
    cwd: '/home/sufuf/sufuf/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    max_memory_restart: '500M'
  }]
};
