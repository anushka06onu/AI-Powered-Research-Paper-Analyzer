# Research Paper Analyzer

A PDF analysis interface with server-side Gemini access. Failed requests show an error; the application never substitutes invented reports or authors.

## Run locally

Use Node 22 or newer. Run `npm ci`, copy `.env.example` to `.env`, and configure a new server-only `GEMINI_API_KEY`. Start `npm run server` and `npm run dev` in separate terminals. Run `npm test` for API validation tests.

## Deploy

Vercel builds the Vite frontend and serves `api/analyze.js` and `api/chat.js`. Configure `GEMINI_API_KEY` and optional `GEMINI_MODEL` as server environment variables. Never use a `VITE_` variable for an API key. Revoke any old key previously embedded in a frontend deployment. The configurable default model is Gemini 2.5 Flash.

## Scope and privacy

PDFs must be smaller than 3 MB. Clicking Analyze sends the document through the backend to Google Gemini; upload only permitted material. Nothing is stored by this app, but the provider's own data policies apply. Outputs can contain errors. Chat uses the extracted analysis and says when a claim cannot be supported; it does not pretend to search the original PDF independently.

This anonymous prototype needs deployment-level rate limits, spend controls, and access restrictions before broad public use. Missing credentials produce a clear 503, not a fabricated result.
