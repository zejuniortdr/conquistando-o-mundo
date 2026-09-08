# Conquistando o Mundo — spec de design

Data: 2026-09-07
Status: aprovado (mockup validado em https://claude.ai/code/artifact/e158c077-084e-4f92-800a-7ca88026fcdc)

## 1. O que é

Site estático de roteiros de viagem, publicado no GitHub Pages a partir do repositório
`roteiros/`. Serve a três usos ao mesmo tempo: portfólio público de roteiros, guia de
consulta no celular durante a viagem, e registro cronológico das viagens.

O conceito é **cartografia pessoal com vocabulário de jogo de tabuleiro**: cada cidade é
um território conquistado, cada continente é uma frente, e a home é o tabuleiro. Nada de
estética "wanderlust"; o repertório visual vem de mapa impresso e de peça de jogo.

Idioma: pt-BR apenas. Sem infraestrutura de i18n.

## 2. Estrutura de conteúdo

O diretório é a fonte da verdade da navegação:

```
roteiros/
  <continente>/<pais>/<cidade>/index.md   + fotos da cidade na mesma pasta
```

O `id` de uma cidade é o nome da pasta. Cidades brasileiras e americanas carregam sufixo
de estado no nome da pasta (`penha-sc`, `new-york-ny`) apenas para desambiguar; **o
sufixo nunca aparece no título nem gera nível de navegação por estado**.

Um arquivo por cidade. A página da cidade é simultaneamente o roteiro e o post: tem data
de viagem e entra no feed cronológico. Não existe seção `/blog` separada.

### Frontmatter

Validado por schema no build (Zod, via content collections). Frontmatter inválido quebra
o build, nunca o site.

```yaml
titulo: Lisboa
pais: Portugal
continente: europa            # europa | norte | sul | africa | asia | oceania
coordenadas: [38.72, -9.14]   # [lat, lon]
datas:
  inicio: 2024-05-12          # ISO YYYY-MM-DD
  fim: 2024-05-18
dias: 6
moeda: EUR
custoDia: "€95"
nota: 5                       # 1..5
tags: [urbano, gastronomia, mirante]
capa: ./capa.jpg
resumo: Frase única que aparece no cartão e na busca.
logistica:
  comoChegar: ...
  transporte: ...
  hospedagem: ...
  documentos: ...
  tomadaChip: ...
curadoria:
  valeSe: ...
  euPularia: ...
```

Campos obrigatórios: `titulo`, `pais`, `continente`, `coordenadas`, `datas`, `dias`,
`moeda`, `nota`, `tags`, `resumo`. `logistica` e `curadoria` são opcionais por bloco.

## 3. Navegação — três níveis

Espelha o diretório.

1. **Tabuleiro (home)** — placar, mapa-múndi com um marcador por continente (contagem
   dentro do losango), linha do tempo global "Ordem de conquista", cartões de continente.
   A busca no topo troca os cartões por resultados de cidade.
2. **Continente** — mapa recortado só naquela região, com o continente aceso e o resto do
   mundo esmaecido; um marcador por cidade; filtros de etiqueta restritos às etiquetas
   daquele continente; lista de cidades agrupada por país.
3. **Cidade** — o post. Trilha `Tabuleiro › Continente › País`.

Rotas: `/`, `/<continente>/`, `/<continente>/<pais>/<cidade>/`.

## 4. Mapa

**SVG gerado no build.** Sem Google Maps, sem Leaflet, sem tiles, sem chave de API, sem
billing, sem requisição externa.

- Fonte: Natural Earth 110m (`ne_110m_admin_0_countries`), agrupado pelo campo `continent`
- Simplificação Ramer-Douglas-Peucker, tolerância ~0,6 px na largura de renderização;
  anéis com área desprezível descartados; Antártida cortada
- Projeção equirretangular, `viewBox 3600×1420`, 10 unidades por grau,
  `lon -180..180`, `lat 84..-58`. Um `<path>` por continente, litoral e fronteiras reais
- Resultado ~74 KB, um único SVG reaproveitado nos três níveis por troca de `viewBox`
- Marcadores são `<button>` HTML posicionados em % sobre o SVG — foco de teclado e leitor
  de tela funcionam de graça
- Mapas regionais corrigem o estiramento da equirretangular pelo cosseno da latitude média
- O mapa do continente tem teto de altura `min(62vh, 540px)` e fica centrado

Requisito de funcionar 100% offline foi **abandonado**: sem PWA, sem service worker.

Na página da cidade há um recorte do mesmo SVG mais um link direto
`https://www.google.com/maps/search/?api=1&query=<lat>,<lon>` — só URL, sem API nem JS
externo, e abre o app nativo no celular.

## 5. Identidade visual

Tema **escuro único**. Sem alternador, sem tema claro.

```
--ground    #0B1F27   fundo
--surface   #12303A   cartão, caixa
--tinta     #E4E9D8   texto
--tinta-2   #93A6A9   texto secundário
--linha     #20454F   divisor fraco
--linha-forte #2E5B66 borda
--oceano    #57B0BF   links, capitular
--planalto  #B79C63   sombra sólida
--marco     #F2B705   latão: marcador, estado ativo — único ponto de alta croma
--agua      #0E2A33   fundo do mapa
```

Cores de continente (bloco de tabuleiro, dessaturadas): europa `#4FA6B5`,
norte `#CFA255`, sul `#CE7A52`, africa `#9AAA55`, asia `#9A8CC0`, oceania `#4FA98A`.

### Tipografia

| Papel | Face | Uso |
|---|---|---|
| Display | Archivo, `font-stretch: 120%`, 800 | títulos em caixa alta |
| Leitura | Newsreader, 400 + itálico | corpo do roteiro |
| Dados | Archivo, `font-stretch: 70%`, 600-700, caixa alta, `letter-spacing .09em` | tarja, rótulos, números |

Duas famílias variáveis, self-hosted, subset latin, `font-display: swap`.
Medida de linha do corpo ~66ch. `font-variant-numeric: tabular-nums` em toda coluna de número.

### Elementos de assinatura

- **Tarja** — faixa de dados em Archivo Narrow com coordenadas, dias, mês/ano, moeda e
  custo/dia. É a margem de mapa impresso, e carrega o frontmatter real
- **Peça** — losango de latão. Marcador de cidade pequeno; marcador de continente grande,
  com a contagem dentro
- **Carta de objetivo** — bloco com "Vale a pena se…" e "Eu pularia…", borda fina e sombra
  sólida em `--planalto`, lido como peça de jogo
- **Placar** — territórios / países / frentes / dias em campo

## 6. Movimento

Mínimo. Marcadores entram em varredura com escalonamento de 26-40 ms; hover acende latão
e revela o rótulo; cartão sobe 3 px no hover. `prefers-reduced-motion` desliga tudo.

## 7. Stack e publicação

- **Astro**, content collections com schema Zod
- Zero JS por padrão; ilha apenas para busca e filtros
- Fotos por `astro:assets`, AVIF + WebP, `srcset`, lazy abaixo da dobra,
  capa com `fetchpriority="high"`
- Fotos redimensionadas **antes** do commit por script local; o build gera os derivados
- Busca: índice JSON gerado no build, carregado sob interação
- Publicação: GitHub Actions no próprio repo `roteiros`, em `<usuario>.github.io/roteiros`
- Escala esperada: 20-60 cidades em um ano

## 8. Acessibilidade e qualidade

- Foco visível em `--marco` com `outline-offset`
- Marcadores são botões com `aria-label` "Cidade, País"
- Nenhuma cor definida apenas dentro de media query
- Nada de rolagem horizontal no corpo; tabelas e blocos largos rolam no próprio contêiner

## 9. Fora de escopo

Tema claro, i18n, PWA/offline, mapa de terceiros, CMS visual, mapa com pontos de interesse
dentro da cidade, seção de blog separada, agrupamento por estado.
