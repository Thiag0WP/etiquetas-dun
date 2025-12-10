import { useState } from 'react';
import Papa from 'papaparse';
import { validateLabelList } from '../_utils/validation';

export function useCSVImport() {
  const [validationFeedback, setValidationFeedback] = useState<{
    validCount: number;
    invalidCount: number;
    invalidLabels: any[];
  } | null>(null);

  const importCSV = (
    file: File,
    onSuccess: (labels: any[]) => void,
    onError?: (error: string) => void,
    onLoading?: (message: string) => void
  ) => {
    onLoading?.('Importando arquivo CSV...');
    
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Processar dados do CSV
          const rows = (results.data as any[]).map((r) => {
            const qty = Number(
              String(
                r.qtyPerBox ??
                r.qtdPerBox ??
                r.qtd_caixa ??
                r.qtd ??
                r["QUANTIDADE POR CAIXA"] ??
                r["quantidade"] ??
                r["Quantidade"] ??
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
              boxSize: String(
                r.boxSize ??
                r.tamCaixa ??
                r["tam_caixa"] ??
                r["TAMANHO CAIXA"] ??
                ""
              ).trim(),
              weightKg: String(
                r.weightKg ?? r.pesoKg ?? r["PESO KG"] ?? ""
              ).trim(),
              lot:
                r.lot ?? r.Lote ?? r.lote
                  ? String(r.lot ?? r.Lote ?? r.lote).trim()
                  : undefined,
              expiry:
                r.expiry ?? r.validade ?? r.Validade
                  ? String(r.expiry ?? r.validade ?? r.Validade).trim()
                  : undefined,
            };
          });

          // Validar dados
          const { validLabels, invalidLabels } = validateLabelList(rows);
          
          setValidationFeedback({
            validCount: validLabels.length,
            invalidCount: invalidLabels.length,
            invalidLabels: invalidLabels
          });

          onSuccess(validLabels);

          // Mostrar feedback se houver problemas
          if (invalidLabels.length > 0) {
            alert(
              `Processamento concluído: ${validLabels.length} etiquetas válidas, ${invalidLabels.length} inválidas. Verifique os detalhes abaixo.`
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar CSV';
          onError?.(errorMessage);
        }
      },
      error: (error) => {
        const errorMessage = `Erro ao processar CSV: ${error.message}`;
        onError?.(errorMessage);
      },
    });
  };

  const importQRCSV = (
    file: File,
    onSuccess: (qrList: any[]) => void,
    onError?: (error: string) => void,
    onLoading?: (message: string) => void
  ) => {
    onLoading?.('Importando arquivo CSV...');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const validData = results.data
            .filter((r: any) => r?.value)
            .map((r: any) => ({ label: r.label || undefined, value: r.value }));
          onSuccess(validData);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar CSV';
          onError?.(errorMessage);
        }
      },
      error: (error) => {
        const errorMessage = `Erro ao processar CSV: ${error.message}`;
        onError?.(errorMessage);
      },
    });
  };

  const clearValidation = () => {
    setValidationFeedback(null);
  };

  return {
    importCSV,
    importQRCSV,
    validationFeedback,
    clearValidation,
  };
}