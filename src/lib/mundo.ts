// O SVG entra no bundle como string: sem fs, sem dependência do cwd do build.
// Regerado por `npm run mapa`.
import mundo from "../assets/mundo.svg?raw";

export const MUNDO_SVG: string = mundo;
