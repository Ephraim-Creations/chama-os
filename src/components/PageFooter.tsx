import logoImage from "@/assets/chama-OS-logo.png";

export function PageFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground md:flex-row md:gap-2">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Chama-OS" className="h-7 w-7" />
            © 2026 Chama-OS · Records-only
          </div>
          <span className="hidden md:inline">·</span>
          <a
            href="https://www.ephraimcreations.co.ke/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary font-semibold"
          >
            Powered by Ephraim Creations
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <a href="/about" className="hover:text-foreground">About</a>
          <a href="/contact" className="hover:text-foreground">Contact</a>
          <a href="/#pricing" className="hover:text-foreground">Pricing</a>
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/terms" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
