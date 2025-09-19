export interface DunLabel {
  sku: string;
  gtin14: string;          // 14 dígitos
  product: string;
  qtyPerBox: number;
  boxSize: string;
  weightKg: string;        // manter string por causa da vírgula
  lot?: string;            // (10)
  expiry?: string;         // (17) no formato YYYY-MM-DD
}
