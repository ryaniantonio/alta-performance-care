import postPediatria from "@/assets/post-pediatria.jpg";
import postEsporte from "@/assets/post-esporte.jpg";
import postClinica from "@/assets/post-clinica.jpg";

export type Post = {
  slug: string;
  category: "Pediatria" | "Esporte" | "Clínica";
  title: string;
  excerpt: string;
  readingTime: string;
  image: string;
  body: { heading?: string; paragraph: string }[];
};

export const posts: Post[] = [
  {
    slug: "introducao-alimentar-segura",
    category: "Pediatria",
    title: "Introdução alimentar segura: o que a urgência pediátrica me ensinou",
    excerpt:
      "Dois anos de residência em emergência hospitalar mudaram a forma como conduzo o início da alimentação do seu bebê — segurança vem antes de qualquer tendência.",
    readingTime: "6 min de leitura",
    image: postPediatria,
    body: [
      {
        paragraph:
          "A introdução alimentar é um dos momentos mais aguardados — e mais temidos — pelas famílias. Como nutricionista com residência hospitalar em urgência e emergência pediátrica, posso afirmar: a maior parte dos engasgos e reações alérgicas graves poderia ter sido prevenida com orientação criteriosa.",
      },
      {
        heading: "Segurança antes da estética do prato",
        paragraph:
          "Cortes seguros, texturas adequadas para cada fase e a ordem de introdução dos alérgenos prioritários (ovo, amendoim, peixe, leite) seguem evidências sólidas. Não é sobre fotos bonitas — é sobre proteger o seu filho enquanto ele aprende a comer.",
      },
      {
        heading: "BLW, papas ou método participativo?",
        paragraph:
          "Nenhum método é unanimemente superior. O que define o sucesso é a adaptação ao desenvolvimento neuromotor do bebê, ao contexto familiar e à supervisão constante. Avaliamos juntos qual abordagem faz sentido para a sua rotina.",
      },
      {
        heading: "Sinais de alerta que você precisa reconhecer",
        paragraph:
          "Diferenciar engasgo de sufocamento, identificar reações alérgicas precoces e saber quando procurar atendimento são habilidades que toda família deveria ter. Na primeira consulta, treinamos esses cenários.",
      },
      {
        heading: "Quando a clínica encontra a urgência",
        paragraph:
          "O treinamento hospitalar me deu raciocínio rápido e protocolos claros. No consultório, isso se traduz em condutas seguras, baseadas em evidências e personalizadas — sem modismos.",
      },
    ],
  },
  {
    slug: "avaliacao-antropometrica",
    category: "Esporte",
    title: "Avaliação antropométrica: por que o peso na balança é o que menos importa",
    excerpt:
      "Composição corporal, dobras cutâneas e bioimpedância revelam o que a balança esconde — e mudam completamente a estratégia de hipertrofia e emagrecimento.",
    readingTime: "5 min de leitura",
    image: postEsporte,
    body: [
      {
        paragraph:
          "A balança mede uma única variável: a soma de tudo o que existe no seu corpo. Músculo, gordura, água, conteúdo intestinal — tudo entra na mesma conta. Por isso, conduzir um plano nutricional apenas pelo peso é, no mínimo, impreciso.",
      },
      {
        heading: "O que a antropometria avançada revela",
        paragraph:
          "Com dobras cutâneas, perímetros e bioimpedância, conseguimos estimar massa magra, gordura corporal, distribuição segmentar e até hidratação. Esses dados orientam ajustes finos de calorias, proteína e periodização do treino.",
      },
      {
        heading: "Hipertrofia e emagrecimento ao mesmo tempo",
        paragraph:
          "É possível — especialmente em iniciantes, retorno após pausa ou quando há boa margem de gordura corporal. A antropometria seriada mostra, mês a mês, se a estratégia está funcionando mesmo quando a balança não se move.",
      },
      {
        heading: "Suplementação personalizada de verdade",
        paragraph:
          "Creatina, proteína do soro, cafeína, beta-alanina: cada suplemento tem dose, momento e perfil de atleta ideais. Combinar isso com a avaliação corporal evita gasto desnecessário e potencializa resultados.",
      },
      {
        heading: "Reavaliações como bússola",
        paragraph:
          "A cada 4 a 8 semanas, comparamos números, fotos e desempenho. Isso transforma a consulta nutricional em um processo científico — não em achismo.",
      },
    ],
  },
  {
    slug: "nutricao-clinica-pos-alta",
    category: "Clínica",
    title: "Como a nutrição clínica acelera a recuperação pós-alta hospitalar",
    excerpt:
      "Sair do hospital é metade do caminho. A continuidade nutricional é o que evita reinternações, perda de massa magra e complicações em casa.",
    readingTime: "7 min de leitura",
    image: postClinica,
    body: [
      {
        paragraph:
          "Toda internação — especialmente as longas ou em UTI — gera um custo metabólico significativo. Perda de massa magra, alterações intestinais, déficits de micronutrientes e fadiga prolongada são comuns. O que muitas famílias não sabem é que esse quadro é reversível com acompanhamento certo.",
      },
      {
        heading: "Os primeiros 30 dias depois da alta",
        paragraph:
          "É a janela mais importante. Trabalhamos densidade calórica, qualidade proteica, fracionamento e tolerância digestiva. Pequenos ajustes evitam reinternações e aceleram o retorno às atividades.",
      },
      {
        heading: "Leitura criteriosa de exames",
        paragraph:
          "Hemograma, função renal e hepática, vitamina D, B12, ferro e marcadores inflamatórios contam uma história. Interpretá-los em conjunto com o quadro clínico permite intervir antes que o sintoma apareça.",
      },
      {
        heading: "Saúde intestinal como base",
        paragraph:
          "Antibióticos prolongados, jejum hospitalar e estresse alteram a microbiota. Restabelecer esse equilíbrio melhora imunidade, absorção de nutrientes e disposição.",
      },
      {
        heading: "Crianças pós-alta: cuidado dobrado",
        paragraph:
          "Em pediatria, a recuperação nutricional impacta crescimento, desenvolvimento e prevenção de novas internações. A bagagem da residência em urgência pediátrica é o que sustenta essa conduta no consultório.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}