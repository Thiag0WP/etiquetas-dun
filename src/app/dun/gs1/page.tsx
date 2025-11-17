"use client";

import { useMemo, useState, useEffect } from "react";
import DunLabelComponent from "@/app/_components/DunLabel";
import type { DunLabel } from "@/types/dun";
import { dunSample } from "@/data/dun";
import Papa from "papaparse";
import {
  saveLabelSet,
  getSavedLabelSets,
  deleteLabelSet,
  exportToJSON,
  exportToCSV,
  type SavedLabelSet,
} from "@/app/_utils/labelStorage";

export default function PageGS1() {
  const [labels, setLabels] = useState<DunLabel[]>([dunSample]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [savedSets, setSavedSets] = useState<SavedLabelSet[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    setSavedSets(getSavedLabelSets());
  }, []);

  function handleCSV(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data as any[]).map((r) => {
          const qty = Number(
            String(r.qtyPerBox ?? r.qtdPerBox ?? r.qtd_caixa ?? r.qtd).replace(
              ",",
              "."
            )
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
          } as DunLabel;
        });
        setLabels(rows.filter((x) => x.gtin14 && x.sku));
      },
      error: (err) => alert("Erro no CSV: " + err.message),
    });
  }

  // Layout de impressão: 1 etiqueta por página
  const gridCols = useMemo(() => "grid-cols-1", []);

  const handleSave = () => {
    if (!saveName.trim()) {
      alert("Por favor, insira um nome para salvar");
      return;
    }
    saveLabelSet(saveName, labels, orientation);
    setSavedSets(getSavedLabelSets());
    setSaveName("");
    setShowSaveDialog(false);
    alert("Etiquetas salvas com sucesso!");
  };

  const handleLoad = (set: SavedLabelSet) => {
    setLabels(set.labels);
    setOrientation(set.orientation || "portrait");
    setShowLoadDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este conjunto de etiquetas?")) {
      deleteLabelSet(id);
      setSavedSets(getSavedLabelSets());
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:bg-white">
      <div className="mx-auto max-w-[230mm]">
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
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCSV(f);
              }}
              className="block"
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
          </div>

          {/* Linha 2: Ações */}
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
            <a
              href="data:text/csv;charset=utf-8,sku,gtin14,product,qtyPerBox,boxSize,weightKg,lot,expiry%0A\
D24-ALV26278,27898971826272,Pasta de Dente Relax - Limão e Canela Vegano Alva 90g,24,32X25X16,3,095,L2409-A,2026-03-31"
              download="modelo_dun.csv"
              className="underline text-blue-700"
            >
              Baixar modelo CSV
            </a>
          </div>
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

        <section className={`grid ${gridCols} gap-8 print:gap-0`}>
          {labels.map((d, i) => (
            <div key={i} className="break-after-page print:break-after-page">
              <DunLabelComponent data={d} orientation={orientation} />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
