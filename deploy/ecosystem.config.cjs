// PM2 process file — `pm2 startOrReload deploy/ecosystem.config.cjs` from the repo root.
const path = require("path");

module.exports = {
  apps: [
    {
      name: "shp",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: path.join(__dirname, ".."),
      instances: 1, // safe to raise to "max" once DATABASE_URL points at Postgres (PGlite is single-process)
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "700M",
      time: true,
    },
  ],
};
