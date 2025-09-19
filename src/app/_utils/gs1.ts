import type { DunLabel } from "@/types/dun";

/** Converte YYYY-MM-DD -> YYMMDD (GS1) */
export function toYYMMDD(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const yy = m[1].slice(2);
  return `${yy}${m[2]}${m[3]}`;
}

/**
 * Monta a string GS1-128 (AIs 01, 17, 10).
 * valueForEncoding: string que vai dentro do Code-128.
 * humanReadable: texto mostrado embaixo do código (com parênteses).
 *
 * Nota: Em GS1-128 verdadeiro, existe FNC1. Alguns leitores
 * interpretam corretamente mesmo sem FNC1 quando há apenas AIs fixos
 * + (10) no final. Para exigência 100% GS1, recomendo gerar via ZPL.
 */
export function buildGS1Strings(d: Pick<DunLabel, "gtin14" | "lot" | "expiry">) {
  const yyMMdd = toYYMMDD(d.expiry);
  // Para “humanReadable”
  const hr =
    `(01)${d.gtin14}` +
    (yyMMdd ? `(17)${yyMMdd}` : "") +
    (d.lot ? `(10)${d.lot}` : "");

  // Para “valueForEncoding” (sem parênteses). Se (10) não for o último,
  // deveria haver um separador GS (ASCII 29). Aqui ele vai por último.
  const enc =
    `01${d.gtin14}` +
    (yyMMdd ? `17${yyMMdd}` : "") +
    (d.lot ? `10${d.lot}` : "");

  return { valueForEncoding: enc, humanReadable: hr };
}
