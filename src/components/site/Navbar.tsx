import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, LogIn } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SITE } from "@/lib/site";
import { WhatsAppButton } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

const links = [
  { label: "Início", to: "/", hash: "" },
  { label: "Especialidades", to: "/", hash: "especialidades" },
  { label: "Sobre", to: "/", hash: "sobre" },
  { label: "Depoimentos", to: "/", hash: "depoimentos" },
  { label: "Blog", to: "/blog", hash: "" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            {SITE.brand}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            | {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={l.hash || undefined}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/75 transition-colors hover:text-accent"
          >
            <LogIn className="size-4" />
            Entrar
          </Link>
          <WhatsAppButton message="Olá Ryani! Gostaria de agendar uma consulta.">
            Agendar Consulta
          </WhatsAppButton>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[78%] max-w-sm">
            <SheetTitle className="font-display text-xl">{SITE.brand}</SheetTitle>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {SITE.name}
            </p>
            <nav className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  hash={l.hash || undefined}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-accent"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-accent"
              >
                <LogIn className="size-4" />
                Entrar / Cadastrar
              </Link>
            </nav>
            <div className="mt-8" onClick={() => setOpen(false)}>
              <WhatsAppButton
                message="Olá Ryani! Gostaria de agendar uma consulta."
                size="lg"
                className="w-full"
              >
                Agendar Consulta
              </WhatsAppButton>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}