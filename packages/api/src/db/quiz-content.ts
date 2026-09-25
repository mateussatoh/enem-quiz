// Initial quiz content, verbatim from the brief. After seeding, the database is the source of
// truth: marketing edits rows directly and the frontend picks changes up without a redeploy.

export const QUIZ_SLUG = "enem";

type SeedQuestion = { text: string; options: [label: string, weight: number][] };

export const quizContent = {
  slug: QUIZ_SLUG,
  title: "Qual é a sua chance real de passar no ENEM?",
  subtitle:
    "Responda 10 perguntas rápidas sobre a sua preparação e receba um diagnóstico personalizado.",
  questions: [
    {
      text: "Em que etapa dos estudos você está?",
      options: [
        ["Estou no 1º ou 2º ano do ensino médio", 2],
        ["Estou no 3º ano", 5],
        ["Já terminei o ensino médio e estudo por conta", 7],
        ["Já terminei e faço cursinho", 10],
      ],
    },
    {
      text: "Quantas horas por semana você estuda além da escola/cursinho?",
      options: [
        ["Menos de 2 horas", 0],
        ["De 3 a 6 horas", 4],
        ["De 7 a 14 horas", 7],
        ["15 horas ou mais", 10],
      ],
    },
    {
      text: "Quantos simulados completos você já fez?",
      options: [
        ["Nenhum", 0],
        ["1 ou 2", 3],
        ["De 3 a 5", 7],
        ["Mais de 5", 10],
      ],
    },
    {
      text: "Como está sua preparação para a redação?",
      options: [
        ["Nunca escrevi uma redação no modelo ENEM", 0],
        ["Escrevi algumas, mas sem correção", 3],
        ["Escrevo e recebo correção de vez em quando", 7],
        ["Escrevo semanalmente com correção", 10],
      ],
    },
    {
      text: "Você tem um plano de estudos definido?",
      options: [
        ["Não, estudo conforme dá", 0],
        ["Tenho uma ideia geral do que preciso estudar", 3],
        ["Tenho um plano, mas sigo parcialmente", 7],
        ["Tenho um plano e sigo à risca", 10],
      ],
    },
    {
      text: "Qual é a sua maior dificuldade hoje?",
      options: [
        ["Não consigo me organizar nem manter constância", 2],
        ["Matemática e Ciências da Natureza", 5],
        ["Redação", 5],
        ["Linguagens e Ciências Humanas", 7],
        ["Não tenho dificuldade específica, quero melhorar no geral", 10],
      ],
    },
    {
      text: "Qual foi sua média aproximada nos últimos simulados?",
      options: [
        ["Não sei / nunca fiz", 0],
        ["Abaixo de 500", 3],
        ["Entre 500 e 650", 6],
        ["Entre 650 e 750", 8],
        ["Acima de 750", 10],
      ],
    },
    {
      text: "Quão claro está seu objetivo de curso e universidade?",
      options: [
        ["Ainda não sei o que quero cursar", 2],
        ["Tenho duas ou três opções em mente", 5],
        ["Sei o curso, mas não sei a nota de corte", 7],
        ["Sei o curso, a universidade e a nota de corte que preciso", 10],
      ],
    },
    {
      text: "Com que frequência você revisa o conteúdo que já estudou?",
      options: [
        ["Não reviso, só avanço para matéria nova", 0],
        ["Reviso só na véspera das provas", 3],
        ["Reviso de vez em quando, sem método definido", 7],
        ["Tenho uma rotina de revisão programada", 10],
      ],
    },
    {
      text: "Você pretende investir em um cursinho ou mentoria neste ano?",
      options: [
        ["Não pretendo investir", 2],
        ["Talvez, mas ainda não pesquisei nada", 5],
        ["Estou pesquisando opções agora", 8],
        ["Já decidi que vou, só falta escolher onde", 10],
      ],
    },
  ] satisfies SeedQuestion[],
};
