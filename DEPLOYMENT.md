# Deployment Guide - Vercel + MongoDB Atlas

This guide walks you through deploying sixtyoneeighty to Vercel with MongoDB Atlas as the database.

## Prerequisites

- GitHub account (for connecting to Vercel)
- Vercel account (free tier works great)
- MongoDB Atlas account (free tier available)
- OpenRouter API key

## Step 1: Set Up MongoDB Atlas (5 minutes)

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Create a free cluster:**
   - Click "Build a Database"
   - Select "M0 Free" tier
   - Choose your preferred cloud provider and region (closest to your users)
   - Click "Create Cluster"

3. **Configure database access:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set "Database User Privileges" to "Read and write to any database"
   - Click "Add User"

4. **Configure network access:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - This sets IP to `0.0.0.0/0` (safe for serverless deployments)
   - Click "Confirm"

5. **Get your connection string:**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Choose "Node.js" as driver
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual database user password
   - Add the database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-ui`

## Step 2: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Ensure `.env.local` is in `.gitignore`** (it should be by default)
   - Never commit sensitive credentials to Git!

## Step 3: Deploy to Vercel (5 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Select your `chat-ui` repository from the list
   - Click "Import"

3. **Configure the project:**
   - Vercel auto-detects SvelteKit (no config needed!)
   - Click "Deploy" (this first deploy will fail - that's expected)

4. **Add environment variables:**
   - After the first deploy, go to your project dashboard
   - Click "Settings" → "Environment Variables"
   - Add the following variables (one at a time):

   **Required Variables:**
   ```
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   OPENAI_API_KEY=sk-or-v1-your-actual-key-here
   MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-ui
   ```

   **Optional Variables:**
   ```
   PUBLIC_APP_NAME=sixtyoneeighty
   PUBLIC_APP_ASSETS=chatui
   PUBLIC_APP_DESCRIPTION=Internal AI chat interface powered by OpenRouter.
   MONGODB_DB_NAME=chat-ui
   ```

   - For each variable, make sure to select all environments (Production, Preview, Development)

5. **Redeploy:**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Select "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

6. **Wait for deployment** (usually 1-2 minutes)

7. **Visit your app:**
   - Click "Visit" button or use the deployment URL
   - Your app should now be live! 🎉

## Step 4: Test Your Deployment

1. **Open your Vercel URL** (e.g., `your-app.vercel.app`)

2. **Verify the branding:**
   - Page title should show "sixtyoneeighty"
   - Sidebar should display "sixtyoneeighty"

3. **Test model selection:**
   - Click the model selector
   - You should see:
     - Sherlock Think Alpha (default)
     - Sherlock Dash Alpha (fast)

4. **Send a test message:**
   - Type a message and send
   - Verify you get a response from OpenRouter

5. **Check conversation history:**
   - Create a new chat
   - Previous conversations should appear in sidebar
   - Conversations are now persisted in MongoDB Atlas!

## Vercel-Specific Configuration

### Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### Environment Variable Updates

To update environment variables:
1. Go to "Settings" → "Environment Variables"
2. Edit the variable
3. Redeploy for changes to take effect

### Automatic Deployments

Every push to your main branch triggers a new deployment automatically!

For preview deployments:
- Create a new branch
- Push changes
- Vercel creates a unique preview URL

## Troubleshooting

### "Models failed to load"
- **Cause:** Invalid `OPENAI_API_KEY` or `OPENAI_BASE_URL`
- **Fix:** Check environment variables in Vercel dashboard

### "Failed to connect to MongoDB"
- **Cause:** Incorrect `MONGODB_URL` or network access not configured
- **Fix:**
  - Verify connection string format
  - Ensure Network Access allows `0.0.0.0/0` in Atlas
  - Check username/password in connection string

### "Application Error" on first load
- **Cause:** Missing environment variables
- **Fix:** Add all required env vars and redeploy

### Slow initial response
- **Cause:** MongoDB Atlas M0 free tier can have cold starts
- **Fix:** This is normal for free tier, subsequent requests are faster

## Monitoring and Logs

### View Deployment Logs
1. Go to your project in Vercel
2. Click "Deployments"
3. Click on a deployment
4. View "Building" and "Functions" logs

### Runtime Logs
1. Go to "Deployment"
2. Click "Functions" tab
3. Click on a function to see runtime logs
4. Use this to debug API issues

### MongoDB Atlas Monitoring
1. Go to your Atlas cluster
2. Click "Metrics" tab
3. View connection count, operations, and data size

## Cost Considerations

**Free Tier Limits:**

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- More than enough for personal/internal use

**MongoDB Atlas:**
- 512MB storage
- Shared cluster
- Good for ~1000s of conversations
- Upgrade to M2 ($9/month) if you need more

**OpenRouter:**
- Pay per token usage
- Sherlock models pricing varies
- Monitor usage at [openrouter.ai/usage](https://openrouter.ai/usage)

## Next Steps

- Set up a custom domain
- Configure authentication (see main README for OpenID options)
- Monitor OpenRouter usage and costs
- Set up MongoDB Atlas alerts for storage limits

---

Need help? Check the main [README.md](./README.md) for additional configuration options.
