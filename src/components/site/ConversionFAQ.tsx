import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "./WhatsAppButton";
import { useReveal } from "@/hooks/use-reveal";

const faqs = [
  {
    q: "Como funciona a primeira consulta?",
    a: "A primeira consulta dura entre 60 e 90 minutos. Fazemos anamnese clínica completa, revisão de exames recentes, avaliação antropométrica (dobras, perímetros e bioimpedância quando indicado) e definimos juntos as metas e estratégia inicial.",
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
              message="Olá Ryani! Gostaria de agendar uma consultoria online (telemedicina)."
              size="lg"
              variant="outline"
            >
              Consultoria Online
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
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}