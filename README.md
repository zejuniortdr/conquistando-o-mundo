# Conquistando o Mundo

Site estático de roteiros de viagem. Cada cidade visitada é um território; cada continente,
uma frente. A home é o tabuleiro.

Feito com Astro, publicado no GitHub Pages. Sem banco, sem servidor, sem chave de API.

## Como o conteúdo é organizado

O diretório é a fonte da verdade da navegação. Não existe arquivo de índice, nem lista de
rotas para manter em dia:

```
<continente>/<país>/<cidade>/index.md
```

```
europa/portugal/lisboa/index.md      → /europa/portugal/lisboa/
america-sul/brasil/penha-sc/index.md → /america-sul/brasil/penha-sc/
```

Continentes reconhecidos: `africa`, `america-norte`, `america-sul`, `asia`, `europa`,
`oceania`.

Cidades brasileiras e americanas levam sufixo de estado na pasta (`penha-sc`,
`new-york-ny`) só para desambiguar homônimas. O sufixo não aparece no título nem cria um
nível de navegação por estado.

Um arquivo por cidade. A página da cidade é o roteiro e o post ao mesmo tempo: tem data de
viagem e entra na linha do tempo da home. Não há seção de blog separada.

## Como adicionar uma cidade

Crie a pasta e o `index.md`:

```bash
mkdir -p europa/espanha/barcelona
$EDITOR europa/espanha/barcelona/index.md
```

O frontmatter é validado por Zod no build. Campo errado quebra o build, não o site.

```yaml
---
titulo: Barcelona
pais: Espanha
paisCodigo: ES                   # ISO 3166-1 alpha-2; vira a bandeira
coordenadas: [41.3874, 2.1686]   # [latitude, longitude]
datas:
  inicio: "2024-06-10"           # ISO, entre aspas
  fim: "2024-06-14"
moeda: EUR
custoDia: "€110"
idioma: Catalão e espanhol
visto: Passaporte brasileiro dispensa visto no espaço Schengen por até 90 dias.
tomada: Tipo F, 230V
melhorEpoca: Maio e setembro, fora do calor e da alta temporada
nota: 4                          # 1 a 5
tags: [urbano, praia, arquitetura]
resumo: Uma frase específica. Aparece no cartão e na busca.
logistica:
  comoChegar: ...
  transporte: ...
  hospedagem: ...
  documentos: ...
  tomadaChip: ...
pontos:                          # só o que foi visitado de fato
  - nome: Sagrada Família
    resumo: Uma ou duas frases concretas.
curadoria:
  valeSe: Para quem esta cidade funciona.
  podePular: O que custou caro e rendeu pouco, com a alternativa junto.
---

Corpo do roteiro em markdown. Sem `#` de nível 1 — o título vem do frontmatter.
```

Obrigatórios: `titulo`, `pais`, `paisCodigo`, `coordenadas`, `datas`, `moeda`, `nota`,
`tags`, `resumo`. O resto é opcional.

`continente` e `dias` não existem no frontmatter: o primeiro vem do caminho da pasta, o
segundo é calculado a partir de `datas`.

Um detalhe de YAML que morde: valor solto contendo `: ` precisa de aspas. Escreva
`podePular: "O museu: caro e vazio"`, não `podePular: O museu: caro e vazio`.

### Fotos

Ainda não há fotos no repositório. Enquanto `capa` não existir, o cartão e o topo da página
usam um gradiente na cor da frente.

Quando forem entrar, guarde-as na pasta da própria cidade e aponte com `capa: ./capa.jpg`.
Redimensione antes de commitar (largura de 2000px resolve): o build gera os derivados em
AVIF e WebP, mas o arquivo original fica no histórico do git para sempre.

## Comandos

```bash
npm install
npm run dev        # servidor local em http://localhost:4321/conquistando-o-mundo/
npm run build      # gera dist/
npm run preview    # serve o dist/ gerado
npm run mapa       # regera src/assets/mundo.svg
```

## O mapa

O mapa-múndi é um SVG de 72 KB gerado no build, versionado em `src/assets/mundo.svg`. Sem
Google Maps, sem Leaflet, sem tiles, sem chave de API, sem requisição externa.

`scripts/gera-mapa.mjs` baixa o Natural Earth 110m, agrupa os países por continente,
simplifica os contornos com Ramer-Douglas-Peucker e projeta em equirretangular num
`viewBox` de `3600×1420` — 10 unidades por grau, longitude de -180 a 180, latitude de 84 a
-58. A Antártida fica de fora.

O mesmo SVG serve os três níveis do site; o que muda é o `viewBox`. Os marcadores são links
HTML posicionados em porcentagem por cima, então foco de teclado e leitor de tela funcionam
sem código extra.

Rode `npm run mapa` só se quiser mudar a tolerância da simplificação ou o recorte. O
GeoJSON baixado fica em `scripts/` e está no `.gitignore`.

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy.yml` builda e publica a cada push na `main`. Node 22,
`npm ci`, `npm run build`, `actions/deploy-pages`.

Para ligar a publicação pela primeira vez:

1. Crie o repositório `zejuniortdr/conquistando-o-mundo` no GitHub, vazio.
2. Confira o remote e empurre a `main`:

   ```bash
   git remote -v   # deve apontar para conquistando-o-mundo.git
   git push -u origin main
   ```

3. No GitHub, vá em **Settings › Pages**. Em Build and deployment, mude Source para
   **GitHub Actions**. Não escolha "Deploy from a branch": o workflow publica o artefato
   direto, sem branch `gh-pages`.
4. Volte à aba Actions. O push já disparou o workflow "Publicar no GitHub Pages". O
   primeiro build leva cerca de um minuto.
5. O site sobe em `https://zejuniortdr.github.io/conquistando-o-mundo/`.

### Quando o nome do repositório muda

`base` no `astro.config.mjs` tem que bater com o nome do repositório, senão todo link
interno dá 404:

```js
site: "https://zejuniortdr.github.io",
base: "/conquistando-o-mundo",
```

Depois de mudar, rode `npm run build` e confira que nenhum link ficou com o caminho antigo:

```bash
grep -o 'href="/[^"]*"' dist/index.html | sort -u
```

### Domínio próprio

Com domínio próprio, o site passa a ser servido na raiz. Ajuste as duas linhas:

```js
site: "https://seu-dominio.com",
base: "/",
```

Depois crie `public/CNAME` com o domínio numa linha só, e aponte o DNS conforme a
documentação do GitHub Pages.

## Decisões que já estão tomadas

Vale saber antes de propor mudança:

- Tema escuro único. Não há tema claro nem alternador.
- Só pt-BR. Sem i18n.
- Não funciona offline. Não há service worker nem PWA.
- Nenhum mapa de terceiros. O motivo é não depender de chave, cota nem billing.
- O texto dos roteiros é impessoal: fala do lugar, não de quem foi.

O raciocínio completo está em [`docs/design.md`](docs/design.md).

## Estrutura do projeto

```
astro.config.mjs
scripts/gera-mapa.mjs           gera o SVG do mapa
src/
  assets/mundo.svg              mapa versionado
  content.config.ts             schema do frontmatter
  consts.ts                     continentes, cores, recortes do mapa
  lib/geo.ts                    projeção e posicionamento
  lib/cidades.ts                derivações e montagem de URL
  components/                   Mapa, CartaCidade, Placar
  layouts/Base.astro
  pages/
    index.astro                 tabuleiro
    [continente]/index.astro    frente
    [continente]/[pais]/[cidade].astro
  styles/global.css
<continente>/<país>/<cidade>/index.md
```
