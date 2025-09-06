# Copilot Coding Agent Instructions

## Project Overview
This repository is for the Benefits Chatbot, a Next.js/TypeScript application with custom components, API routes, and admin interfaces. It uses modern frontend tooling (Tailwind, Vitest, Playwright) and cloud deployment (Firebase, Docker).

## Coding Standards
- Use TypeScript for all new code.
- Follow existing file and folder structure conventions.
- Use functional React components and hooks.
- Prefer Tailwind CSS for styling.
- Write clear, concise comments for complex logic.
- Use async/await for asynchronous code.

## Testing & Validation
- Add/maintain unit tests for new features (Vitest).
- Add/maintain end-to-end tests for user flows (Playwright).
- Run `npm run typecheck` before submitting changes.
- Ensure all tests pass before merging.

## Review & Automation
- All PRs should be reviewed by a human before merging.
- Use conventional commit messages (e.g., `feat:`, `fix:`, `chore:`).
- Document major changes in the `README.md` if relevant.

## Deployment
- Use provided scripts (`deploy.sh`) and configs for deployment.
- Update `firebase.json`, `cloudbuild.yaml`, or Dockerfile as needed for infrastructure changes.

## Special Instructions
- Sensitive data must not be committed.
- Use environment variables for secrets.
- If unsure about a change, ask for clarification in the PR description.

---
For more details, see [Best practices for Copilot coding agent in your repository](https://gh.io/copilot-coding-agent-tips).
