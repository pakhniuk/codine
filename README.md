# 📊 Code Counter - GitHub Lines of Code

A beautiful, minimal Next.js app that connects to your GitHub account and calculates the total number of lines of code you've written across all your commits.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![NextAuth](https://img.shields.io/badge/NextAuth-5-purple)

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure sign-in with GitHub
- 📈 **Real-time Statistics** - Calculate lines added and deleted across all repos
- 🎨 **Beautiful UI** - Minimal, clean design with smooth animations
- 🌗 **Dark Mode** - Toggle between light and dark themes
- 📊 **Progress Visualization** - Animated progress bar and counters
- ⚡ **Fast & Responsive** - Built with Next.js App Router and TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A GitHub account
- pnpm (or npm/yarn)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd codine
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Code Counter (or any name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a new **Client Secret**

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
# Generate a random secret: openssl rand -base64 32
AUTH_SECRET=your-random-secret-here

# GitHub OAuth credentials from step 3
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

## 🎯 How It Works

1. **Authentication**: Users sign in with their GitHub account via OAuth
2. **Data Fetching**: The app fetches all public repositories and commits
3. **Analysis**: Calculates lines added and deleted across commits
4. **Display**: Shows beautiful animated statistics

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/)
- **API**: [Octokit REST](https://octokit.github.io/rest.js/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📁 Project Structure

```
codine/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API routes
│   │   └── github-stats/        # GitHub stats API
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── counter-animation.tsx    # Animated number counter
│   ├── loading-animation.tsx    # Loading spinner
│   ├── progress-bar.tsx         # Progress visualization
│   ├── sign-in-button.tsx       # GitHub sign-in button
│   ├── stats-display.tsx        # Stats display component
│   └── theme-toggle.tsx         # Dark mode toggle
├── types/
│   └── next-auth.d.ts          # NextAuth type definitions
├── auth.ts                      # NextAuth configuration
└── README.md
```

## ⚠️ Limitations

- Analyzes up to 50 most recently updated repositories
- Processes up to 100 commits per repository
- GitHub API rate limits may apply (5000 requests/hour for authenticated users)

## 🚢 Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Update GitHub OAuth callback URL to your production URL
5. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📝 License

MIT

## 💡 Future Enhancements

- [ ] Language breakdown visualization
- [ ] Contribution timeline graph
- [ ] Compare with other developers
- [ ] Export statistics as image
- [ ] Support for private repositories

---

Made with 💜 using Next.js and GitHub API
