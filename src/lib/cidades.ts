import { getCollection, type CollectionEntry } from "astro:content";
import { CONTINENTES, MESES, ORDEM_CONTINENTES, type ChaveContinente } from "../consts";

export type Cidade = CollectionEntry<"cidades">;

/** O id é "continente/pais/cidade" — o diretório é a fonte da verdade. */
export function partes(c: Cidade) {
  const [continente, paisSlug, cidadeSlug] = c.id.split("/") as [ChaveContinente, string, string];
  return { continente, paisSlug, cidadeSlug };
}

/** BASE_URL vem com barra final; normaliza para juntar caminhos sem barra dupla. */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Monta um caminho absoluto do site já com o base path da publicação. */
export const url = (caminho = "") => `${BASE}/${caminho.replace(/^\/+/, "")}`;

export const rota = (c: Cidade) => url(`${c.id}/`);

export function dias(c: Cidade) {
  const ms = Date.parse(c.data.datas.fim) - Date.parse(c.data.datas.inicio);
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function quando(c: Cidade) {
  const d = new Date(c.data.datas.inicio + "T00:00:00Z");
  return `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const inicio = (c: Cidade) => Date.parse(c.data.datas.inicio);

/** Bandeira a partir do código ISO alpha-2, via indicadores regionais Unicode. */
export function bandeira(codigo: string) {
  return codigo
    .toUpperCase()
    .split("")
    .map((l) => String.fromCodePoint(0x1f1e6 + l.charCodeAt(0) - 65))
    .join("");
}

export async function todas(): Promise<Cidade[]> {
  const l = await getCollection("cidades");
  return l.sort((a, b) => inicio(a) - inicio(b));
}

export function porContinente(l: Cidade[]) {
  const mapa = new Map<ChaveContinente, Cidade[]>();
  for (const c of l) {
    const k = partes(c).continente;
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k)!.push(c);
  }
  return ORDEM_CONTINENTES.filter((k) => mapa.has(k)).map((k) => ({
    chave: k,
    ...CONTINENTES[k],
    cidades: mapa.get(k)!,
  }));
}

/** Agrupa por país preservando a ordem cronológica de chegada. */
export function porPais(l: Cidade[]) {
  const mapa = new Map<string, Cidade[]>();
  for (const c of l) {
    if (!mapa.has(c.data.pais)) mapa.set(c.data.pais, []);
    mapa.get(c.data.pais)!.push(c);
  }
  return [...mapa.entries()].map(([pais, cidades]) => ({ pais, cidades }));
}

export function placar(l: Cidade[]) {
  return {
    territorios: l.length,
    paises: new Set(l.map((c) => c.data.pais)).size,
    frentes: new Set(l.map((c) => partes(c).continente)).size,
    dias: l.reduce((s, c) => s + dias(c), 0),
  };
}
