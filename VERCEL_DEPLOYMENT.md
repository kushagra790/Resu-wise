# Deploy ResuWise on Vercel

This repo is configured for a single Vercel project:

- React/Vite frontend builds from `frontend`
- Express API runs as a Vercel Function from `api/index.js`
- API requests stay on the same domain under `/api`

## 1. Create MongoDB Atlas Database

Vercel does not run MongoDB for you, so use MongoDB Atlas or another hosted MongoDB provider.

Create a connection string like:

```text
mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/resuwise?retryWrites=true&w=majority
```

In Atlas Network Access, allow Vercel serverless traffic. The simplest setting is `0.0.0.0/0`.

## 2. Import the Project in Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New > Project**.
3. Import the GitHub repo.
4. Use the repository root as the root directory.

The checked-in `vercel.json` supplies:

```text
Install Command: npm --prefix backend ci && npm --prefix frontend ci
Build Command:   npm --prefix frontend run build
Output Directory: frontend/dist
```

## 3. Add Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```text
MONGODB_URI=your MongoDB Atlas connection string
JWT_SECRET=use a long random secret, at least 32 characters
JWT_EXPIRE=1h
UPLOAD_FILE_SIZE_MB=2
```

`CORS_ORIGIN` is optional on Vercel because the frontend and API share the same domain. If you set it, use your deployed Vercel URL:

```text
CORS_ORIGIN=https://your-project.vercel.app
```

Do not set `VITE_API_BASE_URL` for the Vercel deployment unless your API is hosted somewhere else. The frontend defaults to `/api`, which is what this setup uses.

## 4. Deploy

Click **Deploy** in Vercel. After deployment, verify:

```text
https://your-project.vercel.app/api/health
https://your-project.vercel.app/api/quiz/categories
```

The backend seeds quiz questions automatically the first time a function connects to an empty database.

## Notes

File uploads are handled in memory. Vercel Functions currently limit request and response payloads to 4.5 MB, so this setup defaults to 2 MB per uploaded file for the two-file analyzer. The Vercel Function has a 60-second max duration configured in `vercel.json`.
