"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useToast } from "@/app/_components/Toast";
import { parseLabelRows } from "@/app/_utils/csvParser";
import {
  validateLabelList,
  validateGTIN14,
  validateSKU,
  validateProduct,
  validateQuantity,
} from "@/app/_utils/validation";
import {
  saveLabelSet,
  getSavedLabelSets,
  deleteLabelSet,
  type SavedLabelSet,
} from "@/app/_utils/labelStorage";
import type { DunLabel } from "@/types/dun";

export type InvalidLabel = DunLabel & { errors: string[] };

export type ImportFeedback = {
  validCount: number;
  invalidCount: number;
  invalidLabels: InvalidLabel[];
};

/** Estado e ações compartilhadas entre as páginas de etiqueta única e importação CSV. */
export function useLabelWorkspace(initialLabels: DunLabel[] = []) {
  const [labels, setLabels] = useState<DunLabel[]>(initialLabels);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [layout, setLayout] = useState<"single" | "double">("single");
  const [savedSets, setSavedSets] = useState<SavedLabelSet[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [validationFeedback, setValidationFeedback] =
    useState<ImportFeedback | null>(null);

  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    setSavedSets(getSavedLabelSets());
  }, []);

  function handleCSV(file: File) {
    setIsLoading(true);
    setLoadingMessage("Importando arquivo CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = parseLabelRows(res.data as Record<string, unknown>[]);
        const { validLabels, invalidLabels } = validateLabelList(rows);

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

  const handleSave = async () => {
    if (!saveName.trim()) {
      showError("Por favor, insira um nome para salvar");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Salvando etiquetas...");

    // Simular operação assíncrona para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 500));

    saveLabelSet(saveName, labels, orientation);
    setSavedSets(getSavedLabelSets());
    setSaveName("");
    setShowSaveDialog(false);

    setIsLoading(false);
    setLoadingMessage("");
    showSuccess("Etiquetas salvas com sucesso!");
  };

  const handleLoad = async (set: SavedLabelSet) => {
    setIsLoading(true);
    setLoadingMessage("Carregando etiquetas...");

    // Simular operação assíncrona para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300));

    setLabels(set.labels);
    setOrientation(set.orientation || "portrait");
    setShowLoadDialog(false);

    setIsLoading(false);
    setLoadingMessage("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este conjunto de etiquetas?")) {
      deleteLabelSet(id);
      setSavedSets(getSavedLabelSets());
    }
  };

  /** Adiciona uma etiqueta digitada manualmente. Retorna false e mostra o erro se inválida. */
  const addLabel = (label: DunLabel): boolean => {
    if (!validateGTIN14(label.gtin14)) {
      showError("GTIN-14 inválido: deve ter 14 dígitos com dígito verificador correto");
      return false;
    }
    if (!validateSKU(label.sku)) {
      showError("SKU deve ter pelo menos 3 caracteres");
      return false;
    }
    if (!validateProduct(label.product)) {
      showError("Produto deve ter pelo menos 2 caracteres");
      return false;
    }
    if (!validateQuantity(label.qtyPerBox)) {
      showError("Quantidade por caixa deve ser um número inteiro positivo");
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
    orientation,
    setOrientation,
    layout,
    setLayout,
    savedSets,
    showSaveDialog,
    setShowSaveDialog,
    showLoadDialog,
    setShowLoadDialog,
    showManualDialog,
    setShowManualDialog,
    saveName,
    setSaveName,
    isLoading,
    loadingMessage,
    validationFeedback,
    handleCSV,
    handleSave,
    handleLoad,
    handleDelete,
    addLabel,
    removeLabel,
  };
}
