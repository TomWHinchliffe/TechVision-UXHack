# Login Puzzle Hell

Login Puzzle Hell is a React + TypeScript + Vite project that turns the login flow into a playful UX challenge. The app is built to feel like a puzzle-driven authentication experience, with animated interactions and creative onboarding components.

## What this project includes

- React 19 with TypeScript
- Vite development server for fast refresh
- A puzzle-style login UI and interactive screens
- ESLint configuration for code quality

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser at:

```text
http://localhost:3000
```

> Note: The app is configured to serve on port `3000` so it matches the Docker container mapping.

## Run with Docker

To run the app in Docker, build the image and publish port `3000`:

```bash
docker build -t login-puzzle-hell .
docker run -p 3000:3000 login-puzzle-hell
```

Then open:

```text
http://localhost:3000
```

## Build for production

```bash
npm run build
```

## Project structure

- `src/` — application source files
- `src/App.tsx` — main app entry
- `src/main.tsx` — Vite bootstrap
- `vite.config.ts` — Vite configuration
- `package.json` — scripts and dependencies

## Notes

This repo is designed as a UX hack project, focusing on a fun and engaging login experience rather than a full production authentication backend.