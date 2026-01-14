# Email Server (unboxd) — Deployment & Testing

This small Express app acts as an email relay for the unboxd. landing page. It accepts POST requests at `/api/send-confirmation` with a JSON body `{ "email": "user@example.com" }` and sends a confirmation email using Gmail SMTP.

Prerequisites
- Node 16+ (or the version specified in `package.json`)
- A Gmail account with an App Password (recommended) — do NOT use your main account password.

Required environment variables (set these on your hosting service):
- `GMAIL_ACCOUNT` — Gmail address used as the sender (example@gmail.com)
- `GMAIL_PASSWORD` — Gmail App Password
- `ALLOWED_ORIGINS` — comma-separated list of allowed origin URLs (e.g. `https://your-frontend.vercel.app`). If omitted, the server will allow all origins (not recommended for production).
- `PORT` — optional (default 3001)

Recommended deployment options
- Render (easy for long-running Node services)
- Railway
- Heroku
- Vercel (requires converting to a serverless function; see Vercel docs)

Quick Render deployment steps
1. Create a new Web Service on Render and connect to this repository folder `email-server/`.
2. Set the environment variables (`GMAIL_ACCOUNT`, `GMAIL_PASSWORD`, `ALLOWED_ORIGINS`) in the Render dashboard.
3. Deploy. Render will run `npm install` and start the service using the `start` script in `package.json`.

Testing locally

1. Create a `.env` file in this folder with:

```
GMAIL_ACCOUNT=your@gmail.com
GMAIL_PASSWORD=your_app_password
ALLOWED_ORIGINS=http://localhost:4200
PORT=3001
```

2. Install deps and run:

```bash
cd email-server
npm install
node server.js
```

3. Test with curl (or from your frontend):

```bash
curl -X POST http://localhost:3001/api/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

What to check after deploying
- In your hosting dashboard, ensure `GMAIL_ACCOUNT` and `GMAIL_PASSWORD` are set.
- Set `ALLOWED_ORIGINS` to your Vercel frontend URL (e.g. `https://your-site.vercel.app`) to avoid CORS failures.
- From the browser devtools (Network tab) verify the POST to `https://<your-email-server>/api/send-confirmation` succeeds.
- Check the email-server logs for `SMTP Configuration Error` or `Error sending email:` messages.

If you prefer a serverless approach, consider moving the email sending logic into a Supabase Edge Function (already present in `supabase/functions/send-confirmation-email`) or an AWS Lambda/Cloud Function that runs on deploy and is invoked by the frontend.

If you want, I can prepare a `Dockerfile` or Render-specific `service.yaml` next.
