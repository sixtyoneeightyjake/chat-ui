# Authentication Setup Guide

This project uses **Auth.js (NextAuth)** with **Google** and **GitHub** OAuth providers. Sessions are stored in **Vercel KV** (serverless Redis).

## Features

✅ **OAuth Only**: Google and GitHub sign-in
✅ **No Guest Access**: Authentication required for all routes
✅ **Serverless Sessions**: Stored in Vercel KV (Redis)
✅ **No MongoDB for Auth**: Auth is completely decoupled from MongoDB

---

## Prerequisites

1. **Vercel Account** (for KV storage)
2. **Google Cloud Console** account
3. **GitHub** account

---

## Step 1: Generate Auth Secret

Generate a secure random secret for signing tokens:

```bash
openssl rand -base64 32
```

Copy the output and save it - you'll need it for `AUTH_SECRET`.

---

## Step 2: Set Up Vercel KV (Redis)

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Name it (e.g., `chat-ui-sessions`)
7. Click **Create**

Once created, you'll see:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Copy these values for your `.env` file.

### Option B: Via Vercel CLI

```bash
vercel env pull .env.local
```

This will pull all environment variables including KV credentials if already configured.

---

## Step 3: Set Up Google OAuth

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Click **Create Credentials** → **OAuth client ID**
4. Configure consent screen if prompted:
   - User Type: **External**
   - App name: `sixtyoneeighty` (or your app name)
   - Support email: Your email
   - Authorized domains: Add your domain (e.g., `yourdomain.com`)
5. Application type: **Web application**
6. Name: `Chat UI - Google OAuth`
7. **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback/google
   https://yourdomain.com/auth/callback/google
   ```
   *(Replace `yourdomain.com` with your actual domain)*

8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### Update .env

```env
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret
```

---

## Step 4: Set Up GitHub OAuth

### Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: `Chat UI`
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:5173` for dev)
   - **Authorization callback URL**:
     ```
     http://localhost:5173/auth/callback/github
     ```
     For production, add:
     ```
     https://yourdomain.com/auth/callback/github
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

### Update .env

```env
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

---

## Step 5: Configure Environment Variables

Update your `.env.local` or production environment variables:

```env
### Auth.js Configuration ###
AUTH_SECRET=your-random-secret-from-step-1

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# GitHub OAuth
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Vercel KV
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your-kv-token
```

### For Vercel Production

Add these environment variables in the Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable above
3. Set scope to **Production**, **Preview**, and **Development** as needed
4. Click **Save**

---

## Step 6: Test Locally

```bash
npm install
npm run dev
```

1. Open `http://localhost:5173`
2. You should be redirected to `/auth/signin`
3. Click **Continue with Google** or **Continue with GitHub**
4. Complete the OAuth flow
5. You should be redirected back and authenticated

---

## Step 7: Deploy to Vercel

```bash
git add .
git commit -m "Add Auth.js authentication with Google and GitHub"
git push origin your-branch
```

Then deploy via Vercel:

```bash
vercel --prod
```

Or push to your main branch if you have auto-deployment enabled.

---

## How It Works

### Authentication Flow

1. **User visits app** → Redirected to `/auth/signin`
2. **User clicks Google/GitHub** → OAuth flow starts
3. **OAuth provider authenticates** → Redirects back to `/auth/callback/{provider}`
4. **Auth.js creates session** → Stored in Vercel KV
5. **User redirected to app** → Can now access all routes

### Session Management

- Sessions stored in **Vercel KV** (Redis)
- Session duration: **30 days**
- No MongoDB required for authentication
- MongoDB still used for conversations and chat data

### Protected Routes

All routes require authentication **except**:
- `/auth/signin` - Sign-in page
- `/healthcheck` - Health check endpoint

If user is not authenticated, they are redirected to `/auth/signin`.

---

## Troubleshooting

### "Invalid redirect URI" error

Make sure your redirect URIs exactly match in both:
1. Google/GitHub OAuth app settings
2. Your actual deployment URL

Include both localhost (for dev) and production URLs.

### "Session is undefined"

Check that:
1. `AUTH_SECRET` is set
2. `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
3. Vercel KV database is active

### "CSRF token mismatch"

This usually means:
1. `AUTH_SECRET` changed between requests
2. Cookies are blocked
3. Domain mismatch in OAuth settings

### Can't connect to KV

Verify:
1. KV database exists in Vercel
2. Environment variables are correctly set
3. KV is in the same region as your deployment (or accessible)

---

## Sign Out

A sign-out button will be added to the UI. Users can sign out by clicking it, which will:
1. Clear the session from Vercel KV
2. Clear the session cookie
3. Redirect to `/auth/signin`

---

## Security Notes

- ✅ No passwords stored - OAuth only
- ✅ Sessions encrypted and signed
- ✅ CSRF protection enabled
- ✅ Secure cookies (httpOnly, sameSite)
- ✅ No guest access - authentication required

---

## Need Help?

- [Auth.js Documentation](https://authjs.dev)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)

---

## Migration Notes

This replaces the old OIDC authentication system. The old authentication code is still in the codebase but marked as deprecated:

- Old: `src/lib/server/auth.ts` (OIDC)
- New: `src/lib/server/authjs.ts` (Auth.js)

MongoDB is still used for:
- Conversations
- Chat history
- User preferences
- Assistants
- All other app data

Only sessions and authentication are now handled by Auth.js + Vercel KV.
