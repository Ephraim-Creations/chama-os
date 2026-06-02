import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImage from "@/assets/chama-OS-logo.png";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <img src={logoImage} alt="Chama-OS" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
            <div className="font-bold tracking-tight text-sm sm:text-base truncate">Chama-OS</div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="/#features" className="hover:text-foreground">Features</a>
            <a href="/#how" className="hover:text-foreground">How it works</a>
            <a href="/#pricing" className="hover:text-foreground">Pricing</a>
            <a href="/#solution" className="hover:text-foreground">Why Chama-OS</a>
            <a href="/about" className="hover:text-foreground">About</a>
            <a href="/contact" className="hover:text-foreground">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Button variant="ghost" asChild className="hidden h-10 rounded-xl md:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="hidden h-10 rounded-xl font-semibold md:inline-flex">
              <Link to="/start">
                Create my Chama <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background text-foreground">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={logoImage} alt="Chama-OS" className="h-10 w-10 shrink-0" />
                <div className="min-w-0 text-lg font-bold tracking-tight truncate">Chama-OS</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="space-y-6 text-xl font-semibold">
                <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="block text-foreground hover:text-primary">
                  Features
                </a>
                <a href="/#how" onClick={() => setMobileMenuOpen(false)} className="block text-foreground hover:text-primary">
                  How it works
                </a>
                <a href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-foreground hover:text-primary">
                  Pricing
                </a>
                <a href="/#solution" onClick={() => setMobileMenuOpen(false)} className="block text-foreground hover:text-primary">
                  Why Chama-OS
                </a>
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="block text-foreground hover:text-primary">
                  About
                </a>
              </div>

              <div className="mt-12 space-y-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-2xl border border-border bg-card px-5 py-4 text-center font-semibold text-foreground hover:border-primary"
                >
                  Sign in
                </Link>
                <Link
                  to="/start"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-2xl bg-primary px-5 py-4 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Create my Chama
                </Link>
              </div>
            </div>

            <div className="border-t border-border px-6 py-5 text-center text-sm text-muted-foreground">
              Powered by Ephraim Creations
            </div>
          </div>
        </div>
      )}
    </>
  );
}
