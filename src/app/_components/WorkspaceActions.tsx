"use client";

import type { ReactNode } from "react";

type Props = {
  onPrint: () => void;
  onDownloadPDF: () => void;
  onDownloadZip: () => void;
  onExportCSV: () => void;
  zipLabel?: string;
  extra?: ReactNode;
};

export function WorkspaceActions({
  onPrint,
  onDownloadPDF,
  onDownloadZip,
  onExportCSV,
  zipLabel = "Baixar ZIP (PDF por SKU)",
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
        {zipLabel}
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
