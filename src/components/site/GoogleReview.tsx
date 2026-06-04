import { Star, ExternalLink, QrCode } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { GOOGLE_REVIEW_URL, qrCodeUrl } from "@/lib/site";
import { toast } from "sonner";

export function GoogleReview() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="avaliar-google"
      className="scroll-mt-24 bg-muted/50 py-20 sm:py-24"
    >
      <div
        ref={ref}
        className="reveal mx-auto max-w-5xl px-5 sm:px-8"
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="grid gap-0 md:grid-cols-[1.3fr_1fr]">
            <div className="p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-accent" />
                Avaliação no Google
              </div>
              <h2 className="mt-5 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                Sua opinião faz a diferença.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                Foi atendida(o) por mim? Deixe uma avaliação no Google em menos
                de 1 minuto. Cada estrela ajuda outras famílias e atletas a
                encontrarem um cuidado nutricional baseado em evidências.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-6 fill-accent text-accent"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Leva menos de 1 minuto
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    toast.success("Abrindo Google…", {
                      description: "Obrigada pela sua avaliação!",
                    })
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-base font-medium text-accent-foreground shadow-card transition-all duration-300 hover:bg-accent/90 hover:shadow-premium"
                >
                  <Star className="size-4 fill-accent-foreground" />
                  Avaliar no Google
                  <ExternalLink className="size-4" />
                </a>
                <a
                  href="#qrcode-google"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-base font-medium text-foreground transition-colors hover:border-accent hover:text-accent sm:hidden"
                >
                  <QrCode className="size-4" /> Ver QR Code
                </a>
              </div>
            </div>

            <div
              id="qrcode-google"
              className="relative flex flex-col items-center justify-center gap-4 bg-gradient-deep p-8 text-primary-foreground sm:p-12"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">
                Escaneie e avalie
              </p>
              <div className="rounded-2xl bg-background p-4 shadow-premium">
                <img
                  src={qrCodeUrl(GOOGLE_REVIEW_URL, 220)}
                  alt="QR Code para avaliar no Google"
                  width={220}
                  height={220}
                  loading="lazy"
                  className="block size-[180px] sm:size-[220px]"
                />
              </div>
              <p className="max-w-[240px] text-center text-sm text-primary-foreground/75">
                Aponte a câmera do seu celular para o código e deixe sua
                avaliação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}