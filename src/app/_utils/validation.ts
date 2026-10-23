import type { DunLabel } from "@/types/dun";
import type { BonusLabel } from "@/types/bonus";

// Função para validar GTIN-14
export function validateGTIN14(gtin: string): boolean {
  if (!gtin) return false;

  // Remove espaços e verifica se contém apenas números
  const cleaned = gtin.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return false;

  // Algoritmo de validação do dígito verificador para GTIN-14
  const digits = cleaned.split('').map(Number);
  const checkDigit = digits.pop(); // Remove e guarda o último dígito

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheckDigit;
}

// Função para validar SKU
export function validateSKU(sku: string): boolean {
  return Boolean(sku && sku.trim().length >= 3);
}

// Função para validar produto
export function validateProduct(product: string): boolean {
  return Boolean(product && product.trim().length >= 2);
}

// Função para validar quantidade
export function validateQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty > 0;
}

/** Retorna a lista de erros de uma etiqueta DUN (vazia se válida). */
export function validateDunLabel(label: DunLabel): string[] {
  return [
    !validateGTIN14(label.gtin14) &&
      "GTIN-14 inválido: deve ter 14 dígitos com dígito verificador correto",
    !validateSKU(label.sku) && "SKU deve ter pelo menos 3 caracteres",
    !validateProduct(label.product) && "Produto deve ter pelo menos 2 caracteres",
    !validateQuantity(label.qtyPerBox) &&
      "Quantidade por caixa deve ser um número inteiro positivo",
  ].filter((e): e is string => Boolean(e));
}

/** Retorna a lista de erros de uma etiqueta de bonificado (vazia se válida). */
export function validateBonusLabel(label: BonusLabel): string[] {
  return [
    !validateSKU(label.sku) && "SKU deve ter pelo menos 3 caracteres",
    !validateProduct(label.product) && "Descrição deve ter pelo menos 2 caracteres",
  ].filter((e): e is string => Boolean(e));
}

// Função para validar lista inteira de labels
export function validateLabelList<T>(
  labels: T[],
  validate: (label: T) => string[]
): { validLabels: T[]; invalidLabels: (T & { errors: string[] })[] } {
  const validLabels: T[] = [];
  const invalidLabels: (T & { errors: string[] })[] = [];

  labels.forEach((label) => {
    const errors = validate(label);
    if (errors.length === 0) {
      validLabels.push(label);
    } else {
      invalidLabels.push({ ...label, errors });
    }
  });

  return { validLabels, invalidLabels };
}
