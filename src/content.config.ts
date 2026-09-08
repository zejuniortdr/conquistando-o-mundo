import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Pastas de continente reconhecidas. O diretorio e a fonte da verdade da navegacao. */
export const CONTINENTES = [
  "africa",
  "america-norte",
  "america-sul",
  "asia",
  "europa",
  "oceania",
] as const;

const ponto = z.object({
  nome: z.string(),
  resumo: z.string(),
  coordenadas: z.tuple([z.number(), z.number()]).optional(),
});

const cidades = defineCollection({
  loader: glob({
    base: "./",
    pattern: `{${CONTINENTES.join(",")}}/*/*/index.md`,
    // id = "europa/portugal/lisboa" — continente/pais/cidade, igual ao diretorio
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      pais: z.string(),
      /** ISO 3166-1 alpha-2, usado para desenhar a bandeira */
      paisCodigo: z.string().length(2).toUpperCase(),
      /** [latitude, longitude] */
      coordenadas: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
      datas: z.object({ inicio: z.string().date(), fim: z.string().date() }),
      moeda: z.string(),
      custoDia: z.string().optional(),
      idioma: z.string().optional(),
      /** Exigencia de visto para passaporte brasileiro */
      visto: z.string().optional(),
      tomada: z.string().optional(),
      melhorEpoca: z.string().optional(),
      nota: z.number().int().min(1).max(5),
      tags: z.array(z.string()).min(1),
      resumo: z.string(),
      capa: image().optional(),
      logistica: z
        .object({
          comoChegar: z.string().optional(),
          transporte: z.string().optional(),
          hospedagem: z.string().optional(),
          documentos: z.string().optional(),
          tomadaChip: z.string().optional(),
        })
        .optional(),
      /** Pontos efetivamente visitados. Nada generico. */
      pontos: z.array(ponto).default([]),
      curadoria: z
        .object({
          valeSe: z.string().optional(),
          podePular: z.string().optional(),
        })
        .optional(),
    }),
});

export const collections = { cidades };
