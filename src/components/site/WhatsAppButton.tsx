import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  message: string;
  children: ReactNode;
  variant?: "accent" | "outline" | "ghost-light";
  size?: "default" | "lg";
  className?: string;
  showIcon?: boolean;
};

export function WhatsAppButton({
  message,
  children,
  variant = "accent",
  size = "default",
  className,
  showIcon = true,
}: Props) {
  const styles = {
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-premium",
    outline:
      "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
    // Filled teal button: it inherits bg-primary from the Button `default`
    // variant (no variant is passed to <Button>). Keep that fill and use the
    // light primary-foreground token so the label stays legible on the dark teal.
    // On hover, keep the fill (slightly lighter) and lift with shadow-premium —
    // the original hover:bg-foreground/5 turned the fill near-transparent, making
    // the button vanish into the light testimonial card.
    "ghost-light":
      "border border-foreground/15 text-primary-foreground hover:bg-primary/90 hover:shadow-premium",
  } as const;

  return (
    <Button
      asChild
      size={size}
      className={cn(
        "rounded-full font-medium tracking-wide transition-all duration-300",
        size === "lg" && "h-12 px-7 text-base",
        styles[variant],
        className,
      )}
    >
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => toast.success("Abrindo WhatsApp…", { description: "Você será redirecionado para iniciar a conversa." })}
      >
        {showIcon && <MessageCircle className="size-4" />}
        {children}
      </a>
    </Button>
  );
}