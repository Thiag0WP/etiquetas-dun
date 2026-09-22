"use client";

import type { ReactNode } from "react";

type Props = {
  onPrint: () => void;
  onDownloadPDF: () => void;
  onDownloadZip: () => void;
  onLoad: () => void;
  onExportCSV: () => void;
  extra?: ReactNode;
};

export function WorkspaceActions({
  onPrint,
  onDownloadPDF,
  onDownloadZip,
  onLoad,
  onExportCSV,
  extra,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onPrint}
        className="px-4 py-2 rounded-xl bg-black text-white shadow"
      >
        Imprimir
      </button>
      <button
        onClick={onDownloadPDF}
        className="px-4 py-2 rounded-xl bg-green-600 text-white shadow"
      >
        Baixar PDF
      </button>
      <button
        onClick={onDownloadZip}
        className="px-4 py-2 rounded-xl bg-teal-600 text-white shadow"
      >
        Baixar ZIP (PDF por SKU)
      </button>
      <button
        onClick={onLoad}
        className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow"
      >
        Carregar Salvas
      </button>
      <button
        onClick={onExportCSV}
        className="px-4 py-2 rounded-xl bg-purple-600 text-white shadow"
      >
        Exportar CSV
      </button>
      {extra}
    </div>
  );
}
