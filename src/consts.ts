export const SITE = {
  nome: "Conquistando o Mundo",
  descricao: "Roteiros de viagem organizados como um tabuleiro: cada cidade, um território.",
};

export type ChaveContinente =
  | "africa" | "america-norte" | "america-sul" | "asia" | "europa" | "oceania";

/** vb = recorte do mapa daquele continente, em graus. */
export const CONTINENTES: Record<ChaveContinente, {
  nome: string; classe: string; resumo: string;
  vb: { lon0: number; lon1: number; lat0: number; lat1: number };
}> = {
  europa: {
    nome: "Europa", classe: "europa",
    resumo: "Distâncias curtas e fronteiras baratas de cruzar: é o continente onde uma viagem rende mais cidades por semana.",
    vb: { lon0: -25, lon1: 45, lat0: 72, lat1: 34 },
  },
  "america-norte": {
    nome: "América do Norte", classe: "norte",
    resumo: "Escala continental e cultura do carro: as distâncias enganam e o transporte manda no roteiro.",
    vb: { lon0: -168, lon1: -52, lat0: 72, lat1: 7 },
  },
  "america-sul": {
    nome: "América do Sul", classe: "sul",
    resumo: "O quintal de casa, onde serra, litoral e capital cabem num fim de semana longo.",
    vb: { lon0: -82, lon1: -34, lat0: 13, lat1: -56 },
  },
  africa: {
    nome: "África", classe: "africa", resumo: "Frente ainda não aberta.",
    vb: { lon0: -19, lon1: 52, lat0: 38, lat1: -35 },
  },
  asia: {
    nome: "Ásia", classe: "asia", resumo: "Frente ainda não aberta.",
    vb: { lon0: 26, lon1: 150, lat0: 78, lat1: -10 },
  },
  oceania: {
    nome: "Oceania", classe: "oceania", resumo: "Frente ainda não aberta.",
    vb: { lon0: 110, lon1: 180, lat0: -8, lat1: -48 },
  },
};

/** Ordem de exibição das frentes na home. */
export const ORDEM_CONTINENTES: ChaveContinente[] = [
  "europa", "america-norte", "america-sul", "asia", "africa", "oceania",
];

export const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
