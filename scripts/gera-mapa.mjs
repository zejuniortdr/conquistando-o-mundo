// Gera src/assets/mundo.svg a partir do Natural Earth 110m.
// Rode com `npm run mapa` quando quiser regerar. O SVG fica versionado.
import fs from "node:fs";

const FONTE = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson";
const CACHE = "scripts/ne_110m_admin_0_countries.geojson";
const SAIDA = "src/assets/mundo.svg";

if (!fs.existsSync(CACHE)) {
  const r = await fetch(FONTE);
  if (!r.ok) throw new Error(`falha ao baixar Natural Earth: ${r.status}`);
  fs.writeFileSync(CACHE, await r.text());
}
const g = JSON.parse(fs.readFileSync(CACHE, "utf8"));

const LON0=-180, LAT0=84, LAT1=-58, K=10;            // 10 unidades por grau
const X = lon => (lon-LON0)*K;
const Y = lat => (LAT0-lat)*K;
const W = 360*K, H = (LAT0-LAT1)*K;

const MAPA = {
  "Europe":"europa","North America":"norte","South America":"sul",
  "Africa":"africa","Asia":"asia","Oceania":"oceania"
};

// Ramer-Douglas-Peucker
function rdp(pts, tol){
  if(pts.length<3) return pts;
  let dmax=0, idx=0;
  const [ax,ay]=pts[0], [bx,by]=pts[pts.length-1];
  const dx=bx-ax, dy=by-ay, den=Math.hypot(dx,dy)||1;
  for(let i=1;i<pts.length-1;i++){
    const d=Math.abs(dy*pts[i][0]-dx*pts[i][1]+bx*ay-by*ax)/den;
    if(d>dmax){dmax=d; idx=i;}
  }
  if(dmax<=tol) return [pts[0], pts[pts.length-1]];
  return rdp(pts.slice(0,idx+1),tol).slice(0,-1).concat(rdp(pts.slice(idx),tol));
}
// anel fechado degenera no RDP (primeiro ponto == ultimo): parte em dois arcos
function rdpAnel(pts, tol){
  const p = (pts[0][0]===pts[pts.length-1][0] && pts[0][1]===pts[pts.length-1][1]) ? pts.slice(0,-1) : pts.slice();
  if(p.length<4) return pts;
  let m=1, dmax=-1;
  for(let i=1;i<p.length;i++){
    const d=Math.hypot(p[i][0]-p[0][0], p[i][1]-p[0][1]);
    if(d>dmax){dmax=d; m=i;}
  }
  const a = rdp(p.slice(0,m+1), tol);
  const b = rdp(p.slice(m).concat([p[0]]), tol);
  return a.slice(0,-1).concat(b);
}
function area(pts){
  let a=0;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++) a += pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1];
  return Math.abs(a/2);
}

const TOL = 2.0, AREA_MIN = 9;
const d = {};
let anelTotal=0, anelMantido=0;

for(const f of g.features){
  const cont = MAPA[f.properties.continent];
  if(!cont) continue;                                  // fora: Antártica, Sete Mares
  const geo = f.geometry;
  if(!geo) continue;
  const polys = geo.type==="Polygon" ? [geo.coordinates] : geo.coordinates;
  for(const poly of polys){
    for(const ring of poly){
      anelTotal++;
      let pts = ring
        .filter(p => p[1] > LAT1 - 2)                   // corta abaixo do recorte
        .map(p => [ +X(p[0]).toFixed(1), +Y(Math.min(p[1], LAT0)).toFixed(1) ]);
      if(pts.length<4) continue;
      pts = rdpAnel(pts, TOL);
      if(pts.length<4 || area(pts) < AREA_MIN) continue;
      anelMantido++;
      (d[cont] = d[cont] || []).push("M"+pts.map(p=>p[0]+" "+p[1]).join("L")+"Z");
    }
  }
}

const ordem = ["norte","sul","europa","africa","asia","oceania"];
const corpo = ordem.filter(k=>d[k]).map(k =>
  '<path class="terra t-'+k+'" d="'+d[k].join("")+'"/>'
).join("\n");

const svg = '<svg class="mundo" id="mundo" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true">\n'+corpo+'\n</svg>';
fs.mkdirSync("src/assets", { recursive: true });
fs.writeFileSync(SAIDA, svg);
console.log("aneis", anelMantido+"/"+anelTotal, "| bytes", svg.length, "| viewBox", W, H);
