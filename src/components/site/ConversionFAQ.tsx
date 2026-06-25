import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "./WhatsAppButton";
import { useReveal } from "@/hooks/use-reveal";

type Modality = {
  name: string;
  duration: string;
  description: string;
};

type Faq = {
  q: string;
  a?: string;
  intro?: string;
  modalities?: Modality[];
  footnote?: string;
};

const faqs: Faq[] = [
  {
    q: "Como funciona a primeira consulta?",
    intro:
      "Cada formato é desenhado conforme o seu objetivo principal:",
    modalities: [
      {
        name: "Orientação Nutricional",
        duration: "1 hora",
        description:
          "Direcionamento prático para quem busca ajustes pontuais, esclarecimentos de dúvidas, orientação sobre a dieta em uso e clareza sobre o próximo passo.",
      },
      {
        name: "Consulta Clínica Completa",
        duration: "2 horas",
        description:
          "Anamnese aprofundada, revisão de exames recentes, planejamento alimentar e avaliação antropométrica (dobras, perímetros e bioimpedância quando indicado).",
      },
      {
        name: "Personal Diet",
        duration: "4 horas",
        description:
          "Atendimento imersivo, na casa do cliente, com planejamento alimentar individualizado e acompanhamento prático no seu ambiente.",
      },
      {
        name: "Dietoterapia Enteral",
        duration: "4 horas",
        description:
          "Avaliação especializada para pacientes em terapia nutricional enteral, com avaliação nutricional, avaliação antropométrica, análise de exames e ajustes de volume conforme necessidade.",
      },
      {
        name: "Home Care",
        duration: "4 horas",
        description:
          "Suporte nutricional domiciliar para casos complexos, integrando família, equipe e plano terapêutico.",
      },
    ],
    footnote:
      "Não trabalho com protocolos genéricos: cada plano é construído a partir de exames, antropometria e histórico individual.",
  },
  {
    q: "Atendimento online ou presencial: qual escolher?",
    a: "Ambos seguem o mesmo protocolo clínico. O presencial é indicado quando a avaliação antropométrica completa é central ao tratamento. O online (telemedicina) atende com excelência todos os outros casos — clínica, esporte e pediatria — com cronograma flexível.",
  },
  {
    q: "Quando devo fazer o retorno?",
    a: "O primeiro retorno costuma acontecer entre 21 e 30 dias, para ajustar o plano com base na adaptação. Em seguida, retornos mensais ou bimestrais conforme o objetivo. Reavaliações antropométricas são feitas a cada 4 a 8 semanas.",
  },
  {
    q: "Preciso levar exames laboratoriais?",
    a: "Sim, sempre que possível. Hemograma, perfil lipídico, glicemia, vitamina D, B12, ferritina e TSH são um bom ponto de partida. Em casos clínicos específicos ou pediátricos, indico os exames complementares necessários antes do retorno.",
  },
];

export function ConversionFAQ() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="contato" className="scroll-mt-24 bg-gradient-deep py-20 text-primary-foreground sm:py-28">
      <div
        ref={ref}
        className="reveal mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">
            Vamos começar
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Pronto para transformar sua saúde através de evidências científicas?
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/75">
            Escolha o formato ideal para o seu momento. Em ambos, você recebe o
            mesmo cuidado técnico e personalizado.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <WhatsAppButton
              message="Olá Ryani! Gostaria de agendar uma consulta presencial."
              size="lg"
            >
              Consulta Presencial
            </WhatsAppButton>
            <WhatsAppButton
              message="Olá Ryani! Gostaria de agendar uma consulta online (telemedicina)."
              size="lg"
              variant="outline"
            >
              Consulta Online
            </WhatsAppButton>
          </div>

          <p className="mt-6 text-sm text-primary-foreground/55">
            Atendimento via WhatsApp — resposta em horário comercial.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/55">
            Perguntas frequentes
          </p>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-primary-foreground/15"
              >
                <AccordionTrigger className="text-left font-display text-lg text-primary-foreground hover:text-accent">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-primary-foreground/75">
                  {item.modalities ? (
                    <div className="space-y-5">
                      {item.intro && (
                        <p className="text-primary-foreground/80">{item.intro}</p>
                      )}
                      <ul className="space-y-3">
                        {item.modalities.map((m) => (
                          <li
                            key={m.name}
                            className="group rounded-xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-4 transition hover:border-accent/50 hover:bg-primary-foreground/[0.07]"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <h4 className="font-display text-base text-primary-foreground">
                                {m.name}
                              </h4>
                              <span className="shrink-0 rounded-full border border-accent/40 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                                {m.duration}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                              {m.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                      {item.footnote && (
                        <p className="border-l-2 border-accent/60 pl-4 text-sm italic text-primary-foreground/70">
                          {item.footnote}
                        </p>
                      )}
                    </div>
                  ) : (
                    item.a
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}