import type { DunLabel } from "@/types/dun";

/** Converte as linhas cruas do Papaparse (aceitando cabeçalhos em PT-BR ou EN) para DunLabel[]. */
export function parseLabelRows(rows: Record<string, unknown>[]): DunLabel[] {
  return rows.map((r) => {
    const qty = Number(
      String(
        r.qtyPerBox ??
          r.qtdPerBox ??
          r.qtd_caixa ??
          r.qtd ??
          r["QUANTIDADE POR CAIXA"] ??
          r.quantidade ??
          r.Quantidade ??
          0
      )
        .toString()
        .replace(",", ".")
    );

    return {
      sku: String(r.sku ?? r.SKU ?? "").trim(),
      gtin14: String(r.gtin14 ?? r.GTIN14 ?? r["GTIN-14"] ?? "").trim(),
      product: String(r.product ?? r.produto ?? r.Produto ?? "").trim(),
      qtyPerBox: Number.isFinite(qty) ? qty : 0,
    };
  });
}
