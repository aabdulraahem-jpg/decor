module.exports = {
  apps: [{
    name: 'sufuf-web',
    script: './.next/standalone/server.js',
    cwd: '/home/sufuf/sufuf/web',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3003,
      HOSTNAME: '127.0.0.1',
    },
    max_memory_restart: '500M',
  }],
};
