# ⚡ Quickstart - Code Counter

## 3-Step Setup

### 1️⃣ Create GitHub OAuth App
Visit: https://github.com/settings/developers → New OAuth App
```
Homepage URL: http://localhost:3000
Callback URL: http://localhost:3000/api/auth/callback/github
```

### 2️⃣ Create `.env.local`
```env
AUTH_SECRET=run_this_command → openssl rand -base64 32
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3️⃣ Run
```bash
pnpm install && pnpm dev
```

Open http://localhost:3000 🎉

---

**Need help?** See [SETUP.md](SETUP.md) or [README.md](README.md)

