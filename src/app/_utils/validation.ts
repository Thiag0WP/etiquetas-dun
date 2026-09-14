// Função para validar GTIN-14
export function validateGTIN14(gtin: string): boolean {
  if (!gtin || gtin.length !== 14) return false;

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

// Função para validar lista inteira de labels
export function validateLabelList(labels: any[]): { validLabels: any[]; invalidLabels: any[] } {
  const validLabels: any[] = [];
  const invalidLabels: any[] = [];

  labels.forEach(label => {
    const isGtin14Valid = validateGTIN14(label.gtin14);
    const isSkuValid = validateSKU(label.sku);
    const isProductValid = validateProduct(label.product);
    const isQuantityValid = validateQuantity(label.qtyPerBox);

    if (isGtin14Valid && isSkuValid && isProductValid && isQuantityValid) {
      validLabels.push(label);
    } else {
      invalidLabels.push({
        ...label,
        errors: [
          !isGtin14Valid && 'GTIN-14 inválido',
          !isSkuValid && 'SKU inválido',
          !isProductValid && 'Produto inválido',
          !isQuantityValid && 'Quantidade inválida',
        ].filter(Boolean)
      });
    }
  });

  return { validLabels, invalidLabels };
}
