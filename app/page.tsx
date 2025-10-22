import { auth } from "@/auth"
import { SignInButton } from "@/components/sign-in-button"
import { StatsDisplay } from "@/components/stats-display"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <ThemeToggle />
      
      <main className="flex flex-col items-center justify-center gap-8 max-w-4xl w-full">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Code Counter
            </span>
          </h1>
          <div className="flex justify-center my-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-purple-600"
            >
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground">
            How many lines of code have you written?
          </p>
        </div>

        {session ? (
          <StatsDisplay />
        ) : (
          <div className="flex flex-col items-center gap-6 mt-8">
            <p className="text-lg text-muted-foreground">
              Connect your GitHub account to find out
            </p>
            <SignInButton />
          </div>
        )}
      </main>

      <footer className="absolute bottom-6 text-sm text-muted-foreground">
        <p>
          Made with 💜 using Next.js and GitHub API
        </p>
      </footer>
    </div>
  )
}
