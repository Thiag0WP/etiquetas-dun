import type { FormField } from "@/app/_components/ManualLabelForm";
import type { DunLabel } from "@/types/dun";
import type { BonusLabel } from "@/types/bonus";

export const dunFormFields: FormField[] = [
  { key: "sku", label: "SKU", placeholder: "D24-ALV26278" },
  { key: "gtin14", label: "GTIN-14", placeholder: "14 dígitos", inputMode: "numeric" },
  { key: "product", label: "Produto", placeholder: "Nome do produto" },
  { key: "qtyPerBox", label: "Qtd/Caixa", placeholder: "24", type: "number", min: "1" },
];

export function dunFromForm(v: Record<string, string>): DunLabel {
  return {
    sku: v.sku,
    gtin14: v.gtin14,
    product: v.product,
    qtyPerBox: Number(v.qtyPerBox.replace(",", ".")) || 0,
  };
}

export const bonusFormFields: FormField[] = [
  {
    key: "product",
    label: "Descrição",
    placeholder: "Bonificado - DUN 12un Creme Hidratante Reparador 50ml Alva",
  },
  { key: "sku", label: "SKU", placeholder: "BON-D12-ALV42889" },
];

export function bonusFromForm(v: Record<string, string>): BonusLabel {
  return { sku: v.sku, product: v.product };
}
