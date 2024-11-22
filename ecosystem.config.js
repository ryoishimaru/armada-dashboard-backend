module.exports = {
  apps: [
    {
      name: "armada-backend",
      script: "src/index.js",
      exec_mode: "fork",
      interpreter: "npx",
      interpreter: "babel-node",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};