# 🚀 Quick Setup Guide

Follow these steps to get your Code Counter app running in under 5 minutes!

## Step 1: Create GitHub OAuth App

1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Application name: Code Counter
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```
4. Click **"Register application"**
5. **Important**: Copy your **Client ID** and generate a new **Client Secret**

## Step 2: Create Environment File

Create a file named `.env.local` in the root directory with:

```env
# Generate with: openssl rand -base64 32
AUTH_SECRET=paste-a-random-32-character-string-here

# From GitHub OAuth App
AUTH_GITHUB_ID=paste-your-github-client-id-here
AUTH_GITHUB_SECRET=paste-your-github-client-secret-here

# Leave as is for local development
NEXTAUTH_URL=http://localhost:3000
```

### Generate AUTH_SECRET

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `AUTH_SECRET` value.

## Step 3: Install & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Step 4: Test It Out!

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Sign in with GitHub"**
3. Authorize the app
4. Watch your stats load! ✨

## Troubleshooting

### "Invalid callback URL"
- Make sure your callback URL in GitHub matches exactly: `http://localhost:3000/api/auth/callback/github`

### "Unauthorized" error
- Check that all environment variables are set correctly
- Restart the dev server after changing .env.local

### Stats not loading
- GitHub API has rate limits (5000 requests/hour)
- Try again in a few minutes if you hit the limit

### Dark mode not persisting
- Make sure JavaScript is enabled in your browser
- Check browser console for errors

## Need Help?

Open an issue on GitHub or check the main [README.md](README.md) for more details.

---

Happy coding! 🎉

