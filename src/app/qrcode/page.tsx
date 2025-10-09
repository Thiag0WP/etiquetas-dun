"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useReactToPrint } from "react-to-print";
import { QrCard } from "../_components/QrCard";

type QrData = { label?: string; value: string };

export default function QrCodePage() {
  const [qrList, setQrList] = useState<QrData[]>([]);
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");

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

  // Novo: seletor de formato de papel
  const [paperSize, setPaperSize] = useState<
    "A4" | "60x40" | "100x150" | "custom"
  >("60x40");

  const printRef = useRef<HTMLDivElement>(null);

  // Define o CSS do @page dinamicamente conforme formato
  const pageSizeCSS = {
    A4: "210mm 297mm",
    "60x40": "60mm 40mm",
    "100x150": "100mm 150mm",
    custom: `${widthMm}mm ${heightMm}mm`,
  }[paperSize];

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
                onClick={clearAll}
                className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700"
              >
                🗑️ Limpar tudo
              </button>
            </div>
          )}
        </div>
      </div>

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
            />
          </div>
        ))}
      </div>
    </div>
  );
  // return (
}
