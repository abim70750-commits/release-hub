# Release Hub

**Author:** Abi Manyu (BlueBarry)
**GitHub:** [@abim70750-commits](https://github.com/abim70750-commits)

Full-stack release catalog for APKs. Public catalog + detail page + password-protected admin CRUD.

Stack: Node HTTP (no framework) · SQLite (better-sqlite3) · server-rendered HTML · Docker · Railway.
No build step. No bundler. No SWC.

## Run

    cp .env.example .env
    # edit .env — set ADMIN_PASSWORD and SESSION_SECRET
    npm install
    npm run dev
    # http://localhost:3000 · admin at /admin

Generate a secret:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

## Push

    git init -b main
    git remote add origin git@github.com:abim70750-commits/release-hub.git
    git add .
    git commit -m "initial"
    git push -u origin main

## Deploy (Railway)

1. Railway → New Service → Deploy from GitHub repo `release-hub`.
2. Add a **Volume**, mount at `/data`. SQLite lives there across deploys.
3. Variables: `ADMIN_PASSWORD`, `SESSION_SECRET`, `DB_PATH=/data/release-hub.db`.
4. GitHub → repo → Settings → Secrets and variables → Actions: add `RAILWAY_TOKEN`, `RAILWAY_SERVICE`.
5. `git tag v1.0.0 && git push origin v1.0.0` → CI deploys.

© 2026 Abi Manyu. All rights reserved.
