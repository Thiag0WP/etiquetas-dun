import { useState, useEffect } from 'react';

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

// Função para validar data de validade
export function validateExpiryDate(expiry: string): boolean {
  if (!expiry) return true; // Campo opcional
  
  // Aceita formatos: YYYYMMDD, YYYY-MM-DD, DD/MM/YYYY
  const formats = [
    /^\d{8}$/, // YYYYMMDD
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/ // DD/MM/YYYY
  ];
  
  if (!formats.some(format => format.test(expiry))) return false;
  
  // Converte para Date e verifica se é uma data válida no futuro
  let date: Date;
  if (/^\d{8}$/.test(expiry)) {
    // YYYYMMDD
    const year = parseInt(expiry.substring(0, 4));
    const month = parseInt(expiry.substring(4, 6)) - 1;
    const day = parseInt(expiry.substring(6, 8));
    date = new Date(year, month, day);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
    // YYYY-MM-DD
    date = new Date(expiry);
  } else {
    // DD/MM/YYYY
    const [day, month, year] = expiry.split('/').map(Number);
    date = new Date(year, month - 1, day);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates
  
  return date.getTime() > today.getTime();
}

// Função para validar produto
export function validateProduct(product: string): boolean {
  return Boolean(product && product.trim().length >= 2);
}

// Função para validar quantidade
export function validateQuantity(qty: number): boolean {
  return Number.isInteger(qty) && qty > 0;
}

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Hook para validação de DunLabel
export function useDunLabelValidation(label: any): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  
  useEffect(() => {
    const errors: string[] = [];
    
    // Validar GTIN-14
    if (!validateGTIN14(label.gtin14)) {
      errors.push('GTIN-14 deve conter 14 dígitos válidos');
    }
    
    // Validar SKU
    if (!validateSKU(label.sku)) {
      errors.push('SKU deve ter pelo menos 3 caracteres');
    }
    
    // Validar produto
    if (!validateProduct(label.product)) {
      errors.push('Nome do produto deve ter pelo menos 2 caracteres');
    }
    
    // Validar quantidade
    if (!validateQuantity(label.qtyPerBox)) {
      errors.push('Quantidade deve ser um número inteiro positivo');
    }
    
    // Validar data de validade (opcional)
    if (label.expiry && !validateExpiryDate(label.expiry)) {
      errors.push('Data de validade deve ser válida e futura (YYYYMMDD, YYYY-MM-DD ou DD/MM/YYYY)');
    }
    
    setResult({
      isValid: errors.length === 0,
      errors
    });
  }, [label.gtin14, label.sku, label.product, label.qtyPerBox, label.expiry]);
  
  return result;
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
    const isExpiryValid = validateExpiryDate(label.expiry);
    
    if (isGtin14Valid && isSkuValid && isProductValid && isQuantityValid && isExpiryValid) {
      validLabels.push(label);
    } else {
      invalidLabels.push({
        ...label,
        errors: [
          !isGtin14Valid && 'GTIN-14 inválido',
          !isSkuValid && 'SKU inválido',
          !isProductValid && 'Produto inválido',
          !isQuantityValid && 'Quantidade inválida',
          !isExpiryValid && 'Data de validade inválida'
        ].filter(Boolean)
      });
    }
  });
  
  return { validLabels, invalidLabels };
}