import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "../ui/logo";
import { cn } from "@/utils/misc";
import { buttonVariants } from "@/ui/button-util";
import { Loader2, Video, MessageCircle, BarChart3, Users } from "lucide-react";
import { Button } from "@/ui/button";
import { ThemeSwitcherHome } from "@/ui/theme-switcher";
import ShadowPNG from "/images/shadow.png";
import { useConvexAuth } from "convex/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const theme = "dark";
  return (
    <div className="relative flex h-full w-full flex-col bg-card">
      {/* Navigation */}
      <div className="sticky top-0 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-between p-6 py-3">
        <Link to="/" className="flex h-10 items-center gap-1">
          <Logo />
          <span className="text-xl font-bold text-primary">OOWeb1</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className={buttonVariants({ size: "sm" })}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin w-16 h-4" />}
            {!isLoading && isAuthenticated && "Dashboard"}
            {!isLoading && !isAuthenticated && "Get Started"}
          </Link>
        </div>
      </div>

      {/* Hero Content */}
      <div className="z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-4 px-6">
        <div className="z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-12 md:p-24">
          <Button
            variant="outline"
            className={cn(
              "hidden h-8 rounded-full bg-green-500/10 px-3 text-sm font-bold backdrop-blur hover:text-primary dark:bg-green-500/10 md:flex",
            )}
          >
            <span className="flex items-center gap-2 font-medium text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Video className="h-3 w-3" />
              </span>
              Premium Golf Coaching
            </span>
          </Button>
          <h1 className="text-center text-5xl font-bold leading-tight text-primary md:text-6xl lg:leading-tight">
            Transform Your Golf Game
            <br />
            With Expert Coaching
          </h1>
          <p className="max-w-screen-md text-center text-lg !leading-normal text-muted-foreground md:text-xl">
            Access professional video lessons, connect with certified coaches,
            and track your progress with{" "}
            <span className="font-medium text-primary">OOWeb1</span>
            <br className="hidden lg:inline-block" /> The complete platform for
            golfers ready to improve.
          </p>
          <div className="mt-2 flex w-full items-center justify-center gap-2">
            <Link
              to="/login"
              className={cn(buttonVariants({ size: "sm" }), "hidden sm:flex")}
            >
              Start Your Journey
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "hidden dark:bg-secondary dark:hover:opacity-80 sm:flex",
              )}
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div
          id="features"
          className="flex w-full flex-col items-center justify-center gap-2"
        >
          <h2 className="text-center font-serif text-xl font-medium text-primary/60">
            Core Features
          </h2>
          <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">Video Lessons</h3>
              <p className="text-sm text-muted-foreground">
                Browse our library of professional golf coaching videos
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">Coach Chat</h3>
              <p className="text-sm text-muted-foreground">
                Direct messaging with certified golf instructors
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">Handicap Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and improve your handicap over time
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">Video Uploads</h3>
              <p className="text-sm text-muted-foreground">
                Submit swing videos for personalized coach feedback
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative z-10 flex flex-col border border-border backdrop-blur-sm lg:flex-row">
          <div className="flex w-full flex-col items-start justify-center gap-6 border-r border-primary/10 p-10 lg:p-12">
            <p className="text-lg text-primary/60">
              <span className="font-semibold text-primary">
                Expert Coaches.
              </span>{" "}
              Learn from PGA professionals and certified instructors.
            </p>
            <Link
              to="/login"
              className={buttonVariants({ size: "sm" })}
            >
              Join Today
            </Link>
          </div>
          <div className="flex w-full flex-col items-start justify-center gap-6 p-10 lg:w-[60%] lg:border-b-0 lg:p-12">
            <p className="text-lg text-primary/60">
              <span className="font-semibold text-primary">
                Track Progress.
              </span>{" "}
              Monitor your handicap and see your improvement over time.
            </p>
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Get Started Free
            </Link>
          </div>

          <div className="absolute left-0 top-0 z-10 flex flex-col items-center justify-center">
            <span className="absolute h-6 w-[1px] bg-primary/40" />
            <span className="absolute h-[1px] w-6 bg-primary/40" />
          </div>
          <div className="absolute bottom-0 right-0 z-10 flex flex-col items-center justify-center">
            <span className="absolute h-6 w-[1px] bg-primary/40" />
            <span className="absolute h-[1px] w-6 bg-primary/40" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 flex w-full flex-col items-center justify-center gap-8 py-6">
        <ThemeSwitcherHome />

        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <p className="flex items-center whitespace-nowrap text-center text-sm font-medium text-primary/60">
            &copy; {new Date().getFullYear()} OOWeb1 - Premium Golf Coaching
            Platform
          </p>
        </div>
      </footer>

      {/* Background */}
      <img
        src={ShadowPNG}
        alt="Hero"
        className={`fixed left-0 top-0 z-0 h-full w-full opacity-60 ${theme === "dark" ? "invert" : ""}`}
      />
      <div className="base-grid fixed h-screen w-screen opacity-40" />
      <div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
    </div>
  );
}
