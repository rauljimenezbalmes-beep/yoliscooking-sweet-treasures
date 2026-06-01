import { Instagram, Facebook } from "lucide-react";

// TikTok icon (lucide doesn't ship one)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.18a8.16 8.16 0 0 0 4.77 1.52V7.27a4.85 4.85 0 0 1-1.84-.58Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <h3 className="font-display text-xl text-foreground">Síguenos en redes sociales</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Descubre cada nueva tarta recién horneada
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://tiktok.com/@lacocinadeyoli"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="TikTok"
              className="grid h-11 w-11 place-items-center rounded-full bg-background text-foreground shadow-card transition-all hover:-translate-y-0.5 hover:text-primary"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/lacocinadeyoli"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-full bg-background text-foreground shadow-card transition-all hover:-translate-y-0.5 hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com/lacocinadeyoli"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="grid h-11 w-11 place-items-center rounded-full bg-background text-foreground shadow-card transition-all hover:-translate-y-0.5 hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>

          <p className="pt-4 text-sm text-muted-foreground">
            La Cocina De Yoli © 2026 · Repostería artesanal hecha con cariño.
          </p>
        </div>
      </div>
    </footer>
  );
}
