"use client";

import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { useReactToPrint } from "react-to-print";
import { QrCard } from "../_components/QrCard";

type QrData = { label?: string; value: string };

interface SavedQrSet {
  id: string;
  name: string;
  qrList: QrData[];
  createdAt: string;
  orientation?: "portrait" | "landscape";
  settings?: {
    color: string;
    bgColor: string;
    widthMm: number;
    heightMm: number;
    qrSizePercent: number;
    labelFontSize: number;
    valueFontSize: number;
    autoFont: boolean;
    showLabels: boolean;
    showValues: boolean;
    paperSize: "A4" | "60x40" | "100x150" | "custom";
    rotateText?: boolean;
  };
}

const STORAGE_KEY = "qr-saved-sets";

export default function QrCodePage() {
  const [qrList, setQrList] = useState<QrData[]>([]);
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  // Estados para salvamento
  const [savedSets, setSavedSets] = useState<SavedQrSet[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Cores e estilos
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  // Dimensões padrão
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(40);
  const [qrSizePercent, setQrSizePercent] = useState(70);
  const [labelFontSize, setLabelFontSize] = useState(8);
  const [valueFontSize, setValueFontSize] = useState(6);
  const [autoFont, setAutoFont] = useState(false); // 💥 nova opção automática
  const [showLabels, setShowLabels] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [rotateText, setRotateText] = useState(false); // Nova opção para rotacionar texto

  // Novo: seletor de formato de papel
  const [paperSize, setPaperSize] = useState<
    "A4" | "60x40" | "100x150" | "custom"
  >("60x40");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedSets();
  }, []);

  // Funções de salvamento
  const loadSavedSets = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      setSavedSets(data ? JSON.parse(data) : []);
    } catch {
      setSavedSets([]);
    }
  };

  const handleSaveSet = () => {
    if (!saveName.trim()) {
      alert("Por favor, insira um nome para salvar");
      return;
    }

    const newSet: SavedQrSet = {
      id: Date.now().toString(),
      name: saveName,
      qrList,
      createdAt: new Date().toISOString(),
      orientation,
      settings: {
        color,
        bgColor,
        widthMm,
        heightMm,
        qrSizePercent,
        labelFontSize,
        valueFontSize,
        autoFont,
        showLabels,
        showValues,
        paperSize,
        rotateText,
      },
    };

    const updatedSets = [...savedSets, newSet];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
    setSavedSets(updatedSets);
    setSaveName("");
    setShowSaveDialog(false);
    alert("QR Codes salvos com sucesso!");
  };

  const handleLoadSet = (set: SavedQrSet) => {
    setQrList(set.qrList);
    setOrientation(set.orientation || "portrait");

    if (set.settings) {
      setColor(set.settings.color);
      setBgColor(set.settings.bgColor);
      setWidthMm(set.settings.widthMm);
      setHeightMm(set.settings.heightMm);
      setQrSizePercent(set.settings.qrSizePercent);
      setLabelFontSize(set.settings.labelFontSize);
      setValueFontSize(set.settings.valueFontSize);
      setAutoFont(set.settings.autoFont);
      setShowLabels(set.settings.showLabels);
      setShowValues(set.settings.showValues);
      setPaperSize(set.settings.paperSize);
      setRotateText(set.settings.rotateText || false);
    }

    setShowLoadDialog(false);
  };

  const handleDeleteSet = (id: string) => {
    if (confirm("Deseja realmente excluir este conjunto de QR Codes?")) {
      const updatedSets = savedSets.filter((set) => set.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
      setSavedSets(updatedSets);
    }
  };

  const exportToJSON = (set: SavedQrSet) => {
    const dataStr = JSON.stringify(set, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcodes-${set.name}-${set.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["label", "value"];
    const rows = qrList.map((qr) => [qr.label || "", qr.value]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcodes-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Define o CSS do @page dinamicamente conforme formato e orientação
  const getPageSize = () => {
    const sizes = {
      A4: orientation === "landscape" ? "297mm 210mm" : "210mm 297mm",
      "60x40": orientation === "landscape" ? "60mm 40mm" : "40mm 60mm",
      "100x150": orientation === "landscape" ? "150mm 100mm" : "100mm 150mm",
      custom:
        orientation === "landscape"
          ? `${heightMm}mm ${widthMm}mm`
          : `${widthMm}mm ${heightMm}mm`,
    };
    return sizes[paperSize];
  };

  const pageSizeCSS = getPageSize();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Etiquetas QR",
    pageStyle: `
      @page {
        size: ${pageSizeCSS};
        margin: 0mm;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .no-print { display: none !important; }
        .print-page {
          margin: 0 !important;
          padding: 0 !important;
          page-break-after: always;
        }
      }
    `,
  });

  // Exemplo CSV
  const exampleCsv = `label,value
"Produto A","7891234567890"
"Produto B","https://alvapersonalcare.com.br"
"Produto C","https://wa.me/5547999999999"`;

  const handleDownloadExample = () => {
    const blob = new Blob([exampleCsv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exemplo-qrcode.csv";
    link.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validData = results.data
          .filter((r: any) => r?.value)
          .map((r: any) => ({ label: r.label || undefined, value: r.value }));
        setQrList(validData);
      },
    });
  };

  const addManualQr = () => {
    if (!input.trim()) return;
    setQrList([...qrList, { label, value: input }]);
    setInput("");
    setLabel("");
  };

  const clearAll = () => setQrList([]);
  const removeQr = (i: number) =>
    setQrList(qrList.filter((_, idx) => idx !== i));

  // 💥 Calcula fonte automática (proporcional à altura)
  const autoLabelFont = Math.round(heightMm * 0.35);
  const autoValueFont = Math.round(heightMm * 0.25);

  // Define fontes ativas (manual ou automática)
  const finalLabelFont = autoFont ? autoLabelFont : labelFontSize;
  const finalValueFont = autoFont ? autoValueFont : valueFontSize;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 py-6">
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

          <h1 className="text-3xl font-bold text-gray-900">
            🔳 Gerador de Etiquetas QR
          </h1>
          <p className="text-gray-600 mt-2">
            Gere, personalize e imprima etiquetas com QR Codes em qualquer
            formato
          </p>
        </div>
      </div>

      {/* Painel de controle */}
      <div className="max-w-7xl mx-auto px-4 py-6 no-print">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* CSV */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              📁 Importar CSV
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={handleDownloadExample}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm"
              >
                📥 Baixar CSV de exemplo
              </button>
            </div>
          </div>

          {/* Manual */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              ✏️ Adicionar Manualmente
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Label (opcional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="border rounded-md px-3 py-2 w-52"
              />
              <input
                type="text"
                placeholder="Conteúdo do QR Code"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border rounded-md px-3 py-2 w-80"
                onKeyDown={(e) => e.key === "Enter" && addManualQr()}
              />
              <button
                onClick={addManualQr}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                ➕ Adicionar
              </button>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              ⚙️ Configurações
            </h3>

            {/* Formato de papel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  🧾 Tamanho do papel
                </label>
                <select
                  value={paperSize}
                  onChange={(e) =>
                    setPaperSize(
                      e.target.value as "A4" | "60x40" | "100x150" | "custom"
                    )
                  }
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="A4">A4 (210x297mm)</option>
                  <option value="60x40">60x40mm (Zebra)</option>
                  <option value="100x150">100x150mm (transporte)</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Largura (mm)
                </label>
                <input
                  type="number"
                  value={widthMm}
                  disabled={paperSize !== "custom"}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="border rounded-md px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Altura (mm)
                </label>
                <input
                  type="number"
                  value={heightMm}
                  disabled={paperSize !== "custom"}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="border rounded-md px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Cor do QR
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border rounded-md w-full h-10"
                />
              </div>
            </div>

            {/* Sliders e fonte automática */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-sm text-gray-700">Tamanho QR (%)</label>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={qrSizePercent}
                  onChange={(e) => setQrSizePercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {qrSizePercent}%
                </div>
              </div>

              {!autoFont && (
                <>
                  <div>
                    <label className="text-sm text-gray-700">
                      Fonte Label (px)
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="100"
                      value={labelFontSize}
                      onChange={(e) => setLabelFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {labelFontSize}px
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">
                      Fonte Valor (px)
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="80"
                      value={valueFontSize}
                      onChange={(e) => setValueFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {valueFontSize}px
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Opção automática */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={autoFont}
                onChange={(e) => setAutoFont(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                💥 Ativar estilo grande automático ({autoLabelFont}px /{" "}
                {autoValueFont}px)
              </span>
            </div>
          </div>

          {/* Orientação */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800">
              🔄 Orientação de Impressão
            </h3>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => setOrientation("portrait")}
                className={`px-4 py-2 rounded-md font-medium ${
                  orientation === "portrait"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📄 Retrato (Vertical)
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={`px-4 py-2 rounded-md font-medium ${
                  orientation === "landscape"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📃 Paisagem (Horizontal)
              </button>
            </div>

            {/* Opção para rotacionar texto */}
            {orientation === "landscape" && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-md">
                <input
                  type="checkbox"
                  checked={rotateText}
                  onChange={(e) => setRotateText(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  🔄 Rotacionar texto 90° (texto de lado na paisagem)
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          {qrList.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-semibold"
              >
                🖨️ Imprimir {qrList.length} etiquetas
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold"
              >
                💾 Salvar Conjunto
              </button>
              <button
                onClick={() => setShowLoadDialog(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-semibold"
              >
                📂 Carregar Salvos
              </button>
              <button
                onClick={exportToCSV}
                className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-semibold"
              >
                📤 Exportar CSV
              </button>
              <button
                onClick={clearAll}
                className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700"
              >
                🗑️ Limpar tudo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para Salvar */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-black">
              Salvar QR Codes
            </h2>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nome do conjunto de QR Codes"
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
                onClick={handleSaveSet}
                className="px-4 py-2 rounded bg-blue-600 text-white"
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
              QR Codes Salvos
            </h2>
            {savedSets.length === 0 ? (
              <p className="text-gray-600">Nenhum conjunto salvo ainda.</p>
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
                        {set.qrList.length} QR Code(s) •{" "}
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
                        onClick={() => handleLoadSet(set)}
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
                        onClick={() => handleDeleteSet(set.id)}
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

      {/* Área de impressão */}
      <div ref={printRef}>
        {qrList.map((qr, i) => (
          <div key={i} className="print-page flex items-center justify-center">
            <QrCard
              value={qr.value}
              label={qr.label}
              color={color}
              bgColor={bgColor}
              widthMm={widthMm}
              heightMm={heightMm}
              showLabel={showLabels}
              showValue={showValues}
              qrSizePercent={qrSizePercent}
              labelFontSize={finalLabelFont}
              valueFontSize={finalValueFont}
              orientation={orientation}
              rotateText={rotateText}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
