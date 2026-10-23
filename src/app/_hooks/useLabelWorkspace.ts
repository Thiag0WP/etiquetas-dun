"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { useToast } from "@/app/_components/Toast";
import { validateLabelList } from "@/app/_utils/validation";
import { exportLabelsToPDF, exportLabelsToZip } from "@/app/_utils/pdfExport";

export type InvalidLabel<T> = T & { errors: string[] };

export type ImportFeedback<T> = {
  validCount: number;
  invalidCount: number;
  invalidLabels: InvalidLabel<T>[];
};

type WorkspaceConfig<T> = {
  initialLabels?: T[];
  /** Converte as linhas cruas do CSV em etiquetas. */
  parseRows: (rows: Record<string, unknown>[]) => T[];
  /** Retorna os erros de uma etiqueta (vazio se válida). */
  validate: (label: T) => string[];
  /** Nome de cada PDF dentro do ZIP (padrão: SKU). */
  zipFileName?: (label: T) => string;
};

/** Estado e ações compartilhadas entre as páginas de etiquetas (DUN, CSV, bonificado). */
export function useLabelWorkspace<T extends { sku: string }>({
  initialLabels = [],
  parseRows,
  validate,
  zipFileName = (label) => label.sku,
}: WorkspaceConfig<T>) {
  const [labels, setLabels] = useState<T[]>(initialLabels);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [layout, setLayout] = useState<"single" | "double">("single");
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [validationFeedback, setValidationFeedback] =
    useState<ImportFeedback<T> | null>(null);

  /** Nó DOM de cada etiqueta renderizada, na mesma ordem de `labels`. */
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { showSuccess, showError, showWarning } = useToast();

  function handleCSV(file: File) {
    setIsLoading(true);
    setLoadingMessage("Importando arquivo CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = parseRows(res.data as Record<string, unknown>[]);
        const { validLabels, invalidLabels } = validateLabelList(rows, validate);

        setLabels(validLabels);
        setValidationFeedback({
          validCount: validLabels.length,
          invalidCount: invalidLabels.length,
          invalidLabels,
        });

        setIsLoading(false);
        setLoadingMessage("");

        if (invalidLabels.length > 0) {
          showWarning(
            `Processamento concluído: ${validLabels.length} etiquetas válidas, ${invalidLabels.length} inválidas. Verifique os detalhes abaixo.`
          );
        } else {
          showSuccess(
            `${validLabels.length} etiquetas importadas com sucesso!`
          );
        }
      },
      error: (err) => {
        showError("Erro no CSV: " + err.message);
        setIsLoading(false);
        setLoadingMessage("");
      },
    });
  }

  /** Pares etiqueta/nó DOM das etiquetas atualmente renderizadas. */
  const getRenderedLabels = () =>
    labels
      .map((label, i) => ({
        element: labelRefs.current[i],
        name: zipFileName(label),
      }))
      .filter(
        (item): item is { element: HTMLDivElement; name: string } =>
          item.element != null
      );

  /** Gera e baixa um PDF com uma página por etiqueta, no tamanho físico exato. */
  const handleDownloadPDF = async () => {
    const nodes = getRenderedLabels().map((item) => item.element);
    if (nodes.length === 0) {
      showError("Não há etiquetas para gerar o PDF");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Gerando PDF...");

    try {
      await exportLabelsToPDF(
        nodes,
        orientation,
        layout,
        `etiquetas-${Date.now()}.pdf`
      );
      showSuccess("PDF gerado com sucesso!");
    } catch (err) {
      showError(
        "Erro ao gerar PDF: " +
          (err instanceof Error ? err.message : "erro desconhecido")
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  /** Gera e baixa um .zip com um PDF separado por etiqueta, nomeado por `zipFileName`. */
  const handleDownloadZip = async () => {
    const items = getRenderedLabels();
    if (items.length === 0) {
      showError("Não há etiquetas para gerar o ZIP");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Gerando ZIP com PDFs individuais...");

    try {
      await exportLabelsToZip(
        items,
        orientation,
        layout,
        `etiquetas-${Date.now()}.zip`
      );
      showSuccess("ZIP gerado com sucesso!");
    } catch (err) {
      showError(
        "Erro ao gerar ZIP: " +
          (err instanceof Error ? err.message : "erro desconhecido")
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  /** Adiciona uma etiqueta digitada manualmente. Retorna false e mostra o erro se inválida. */
  const addLabel = (label: T): boolean => {
    const errors = validate(label);
    if (errors.length > 0) {
      showError(errors[0]);
      return false;
    }

    setLabels((prev) => [...prev, label]);
    showSuccess("Etiqueta adicionada!");
    return true;
  };

  const removeLabel = (index: number) => {
    setLabels((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    labels,
    setLabels,
    labelRefs,
    orientation,
    setOrientation,
    layout,
    setLayout,
    showManualDialog,
    setShowManualDialog,
    isLoading,
    loadingMessage,
    validationFeedback,
    handleCSV,
    handleDownloadPDF,
    handleDownloadZip,
    addLabel,
    removeLabel,
  };
}
