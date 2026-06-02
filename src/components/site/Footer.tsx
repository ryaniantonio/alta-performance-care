import { Instagram, Linkedin } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl text-foreground">
            {SITE.brand} <span className="text-muted-foreground">| {SITE.name}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{SITE.crn} · Nutricionista</p>
          <p className="mt-1 text-sm text-muted-foreground">WhatsApp: {SITE.whatsappDisplay}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conecte-se</p>
          <div className="mt-3 flex gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Aviso</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            As informações contidas neste site possuem caráter puramente
            educativo e não substituem a consulta médica ou nutricional.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} {SITE.name}. Todos os direitos reservados.</p>
          <p>Feito com cuidado científico e estético.</p>
        </div>
      </div>
    </footer>
  );
}