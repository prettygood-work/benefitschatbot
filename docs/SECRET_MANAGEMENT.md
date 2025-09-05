# Secret Management

This project relies on external services such as Firebase, Google Cloud, and AI providers. Secrets must **never** be committed to version control.

## Local Development
1. Copy `.env.local.example` to `.env.local`.
2. Populate the file with your credentials:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_GENERATIVE_AI_API_KEY` (or other AI provider keys)
   - `RESEND_API_KEY`
   - `GCS_BUCKET_NAME`
3. Keep `.env.local` out of Git. It is ignored via `.gitignore`.

## Production Deployment
- Store the same variables in your hosting environment or a secret manager (e.g., Google Secret Manager).
- For Firebase Functions, set runtime config values:
  ```bash
  firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
  ```
- Grant service accounts only the permissions they require.

## Runtime Injection
Next.js automatically loads variables from the environment. Ensure the necessary keys are available before starting the server:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=... pnpm start
```

By centralizing secrets in environment variables and secret managers, the application avoids leaking credentials and simplifies configuration across environments.
