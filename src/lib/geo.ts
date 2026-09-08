/**
 * Projeção equirretangular usada pelo mapa.
 * O SVG em src/assets/mundo.svg tem viewBox "0 0 3600 1420":
 * 10 unidades por grau, longitude -180..180 e latitude 84..-58.
 */
const K = 10;
const LON_MIN = -180;
const LAT_MAX = 84;

export const MUNDO: Caixa = { x: 0, y: 0, w: 3600, h: 1420, latMed: 13 };

export interface Caixa { x: number; y: number; w: number; h: number; latMed: number }
export interface Recorte { lon0: number; lon1: number; lat0: number; lat1: number }

export const X = (lon: number) => (lon - LON_MIN) * K;
export const Y = (lat: number) => (LAT_MAX - lat) * K;

export function caixa(r: Recorte): Caixa {
  const x = X(r.lon0);
  const y = Y(r.lat0);
  return { x, y, w: X(r.lon1) - x, h: Y(r.lat1) - y, latMed: (r.lat0 + r.lat1) / 2 };
}

/** Recorte quadrado ao redor de um ponto, em graus de latitude. */
export function aoRedor(lat: number, lon: number, raioGraus = 21): Caixa {
  const r = raioGraus * K;
  // a equirretangular estica a longitude perto dos polos; alarga o recorte para compensar
  const rx = r / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  return { x: X(lon) - rx, y: Y(lat) - r, w: rx * 2, h: r * 2, latMed: lat };
}

/** Posição de um ponto dentro de uma caixa, em porcentagem. */
export function posicao(lat: number, lon: number, c: Caixa) {
  return {
    left: ((X(lon) - c.x) / c.w) * 100,
    top: ((Y(lat) - c.y) / c.h) * 100,
  };
}

/** Proporção de tela que devolve a forma correta apesar da equirretangular. */
export function proporcao(c: Caixa) {
  return (c.w * Math.cos((c.latMed * Math.PI) / 180)) / c.h;
}

export const viewBox = (c: Caixa) => `${c.x} ${c.y} ${c.w} ${c.h}`;

export function coordenada(v: number, pos: string, neg: string) {
  const s = v < 0 ? neg : pos;
  const a = Math.abs(v);
  const g = Math.floor(a);
  const m = Math.round((a - g) * 60);
  return `${g}°${String(m).padStart(2, "0")}′${s}`;
}

export const parCoordenadas = ([lat, lon]: [number, number]) =>
  `${coordenada(lat, "N", "S")} ${coordenada(lon, "L", "O")}`;
