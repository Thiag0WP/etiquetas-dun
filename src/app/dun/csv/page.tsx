"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import DunLabel from "@/app/_components/DunLabel";
import DunLabelContainer from "@/app/_components/DunLabelContainer";
import { FileDropZone } from "@/app/_components/FileDropZone";
import { ValidationFeedback } from "@/app/_components/ValidationFeedback";
import { useToast } from "@/app/_components/Toast";
import { validateLabelList } from "@/app/_utils/validation";
import type { DunLabel as DunLabelType } from "@/types/dun";
import {
  saveLabelSet,
  getSavedLabelSets,
  deleteLabelSet,
  exportToJSON,
  exportToCSV,
  type SavedLabelSet,
} from "@/app/_utils/labelStorage";

export default function PageCsv() {
  const [labels, setLabels] = useState<DunLabelType[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [layout, setLayout] = useState<"single" | "double">("single");
  const [showBoxSize, setShowBoxSize] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [savedSets, setSavedSets] = useState<SavedLabelSet[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Hook para notificações
  const { showSuccess, showError, showWarning } = useToast();

  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(""); // Estados para feedback de validação
  const [validationFeedback, setValidationFeedback] = useState<{
    validCount: number;
    invalidCount: number;
    invalidLabels: any[];
  } | null>(null);

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
        const rows = (res.data as any[]).map((r) => {
          const qty = Number(
            String(
              r["QUANTIDADE POR CAIXA"] ??
                r["qtyPerBox"] ??
                r["qtdPerBox"] ??
                r["qtd_caixa"] ??
                r["qtd"] ??
                r["quantidade"] ??
                r["Quantidade"] ??
                0
            )
              .toString()
              .replace(",", ".")
          );
          return {
            sku: String(r["SKU"] ?? r["sku"] ?? "").trim(),
            gtin14: String(
              r["GTIN-14"] ?? r["gtin14"] ?? r["GTIN14"] ?? ""
            ).trim(),
            product: String(
              r["Produto"] ?? r["produto"] ?? r["product"] ?? ""
            ).trim(),
            qtyPerBox: Number.isFinite(qty) ? qty : 0,
            boxSize: String(
              r["TAMANHO CAIXA"] ??
                r["boxSize"] ??
                r["tamCaixa"] ??
                r["tam_caixa"] ??
                ""
            ).trim(),
            weightKg: String(
              r["PESO KG"] ?? r["weightKg"] ?? r["pesoKg"] ?? ""
            ).trim(),
            lot: undefined, // não vem no CSV
            expiry: undefined, // não vem no CSV
          };
        });

        // Validar dados antes de definir
        const { validLabels, invalidLabels } = validateLabelList(rows);

        setLabels(validLabels);
        setValidationFeedback({
          validCount: validLabels.length,
          invalidCount: invalidLabels.length,
          invalidLabels: invalidLabels,
        });

        setIsLoading(false);
        setLoadingMessage("");

        // Mostrar feedback se houver problemas
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

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:bg-white relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-700 font-medium">{loadingMessage}</span>
          </div>
        </div>
      )}

      {/* Upload + Botões */}
      <header className="print:hidden mb-4 space-y-3">
        {/* Botão Voltar */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar para Início
          </a>
        </div>

        {/* Linha 1: Upload e Orientação */}
        <div className="space-y-4">
          {/* Área de Upload com Drag & Drop */}
          <FileDropZone
            onFileSelect={handleCSV}
            disabled={isLoading}
            className="w-full"
          />

          <div className="flex gap-2 items-center">
            <label className="text-sm font-semibold">Orientação:</label>
            <button
              onClick={() => setOrientation("portrait")}
              className={`px-3 py-1 rounded ${
                orientation === "portrait"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Retrato
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`px-3 py-1 rounded ${
                orientation === "landscape"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Paisagem
            </button>
          </div>

          {/* Controles de Layout */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-semibold">Layout:</label>
            <button
              onClick={() => setLayout("single")}
              className={`px-3 py-1 rounded ${
                layout === "single"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              1 Etiqueta
            </button>
            <button
              onClick={() => setLayout("double")}
              className={`px-3 py-1 rounded ${
                layout === "double"
                  ? "bg-black text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              2 Etiquetas
            </button>
          </div>

          {/* Controles de Campos Opcionais */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-semibold">Mostrar:</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBoxSize}
                onChange={(e) => setShowBoxSize(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Tamanho da Caixa</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showWeight}
                onChange={(e) => setShowWeight(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Peso da Caixa</span>
            </label>
          </div>
        </div>

        {/* Feedback de Validação */}
        {validationFeedback && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Resultado da Importação</h3>
            <div className="flex gap-6 mb-3">
              <div className="text-green-600">
                ✓ {validationFeedback.validCount} etiquetas válidas
              </div>
              {validationFeedback.invalidCount > 0 && (
                <div className="text-red-600">
                  ✗ {validationFeedback.invalidCount} etiquetas com problemas
                </div>
              )}
            </div>

            {validationFeedback.invalidLabels.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-red-700 font-medium hover:text-red-800">
                  Ver problemas detectados
                </summary>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {validationFeedback.invalidLabels.map((label, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-red-400 pl-3 py-2 bg-red-50"
                    >
                      <div className="font-medium text-red-800">
                        SKU: {label.sku || "N/A"} | GTIN:{" "}
                        {label.gtin14 || "N/A"}
                      </div>
                      <div className="text-red-600 text-xs">
                        {label.errors.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Linha 2: Ações */}
        {labels.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-black text-white shadow"
            >
              Imprimir
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 rounded-xl bg-green-600 text-white shadow"
            >
              Salvar Etiquetas
            </button>
            <button
              onClick={() => setShowLoadDialog(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow"
            >
              Carregar Salvas
            </button>
            <button
              onClick={() => exportToCSV(labels)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white shadow"
            >
              Exportar CSV
            </button>
          </div>
        )}
      </header>

      {/* Dialog para Salvar */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">
              Salvar Etiquetas
            </h2>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nome do conjunto de etiquetas"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 text-black placeholder:text-gray-500"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 rounded bg-gray-300 text-black"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog para Carregar */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black">
              Etiquetas Salvas
            </h2>
            {savedSets.length === 0 ? (
              <p className="text-gray-600">Nenhuma etiqueta salva ainda.</p>
            ) : (
              <div className="space-y-3">
                {savedSets.map((set) => (
                  <div
                    key={set.id}
                    className="border border-gray-300 rounded p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-black">{set.name}</h3>
                      <p className="text-sm text-gray-600">
                        {set.labels.length} etiqueta(s) •{" "}
                        {set.orientation === "landscape"
                          ? "Paisagem"
                          : "Retrato"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(set.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(set)}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => exportToJSON(set)}
                        className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 rounded bg-gray-300 text-black"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Etiquetas */}
      {labels.length === 0 ? (
        <p className="text-sm text-gray-600">
          Envie um arquivo CSV com as colunas: SKU, GTIN-14, Descrição, Produto,
          QUANTIDADE POR CAIXA, TAMANHO CAIXA, PESO KG.
        </p>
      ) : (
        <section className="grid gap-8 print:gap-0">
          {labels.map((d, i) => (
            <div key={i} className="break-after-page print:break-after-page">
              <DunLabelContainer
                data={d}
                orientation={orientation}
                layout={layout}
                showBoxSize={showBoxSize}
                showWeight={showWeight}
              />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
