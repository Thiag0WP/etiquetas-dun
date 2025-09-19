"use client";

import { useState } from "react";
import Papa from "papaparse";
import DunLabel from "@/app/_components/DunLabel";
import type { DunLabel as DunLabelType } from "@/types/dun";

export default function PageCsv() {
  const [labels, setLabels] = useState<DunLabelType[]>([]);

  function handleCSV(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data as any[]).map((r) => ({
          sku: String(r["SKU"] ?? "").trim(),
          gtin14: String(r["GTIN-14"] ?? "").trim(),
          product: String(r["Produto"] ?? "").trim(),
          qtyPerBox: Number(r["QUANTIDADE POR CAIXA"] ?? 0),
          boxSize: String(r["TAMANHO CAIXA"] ?? "").trim(),
          weightKg: String(r["PESO KG"] ?? "").trim(),
          lot: undefined, // não vem no CSV
          expiry: undefined, // não vem no CSV
        }));
        setLabels(rows.filter((x) => x.sku && x.gtin14));
      },
      error: (err) => alert("Erro no CSV: " + err.message),
    });
  }

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:bg-white">
      {/* Upload + Botões */}
      <header className="print:hidden mb-4 flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCSV(f);
          }}
          className="block bg-gray-600 text-white px-4 py-2 rounded-xl cursor-pointer shadow"
        />
        {labels.length > 0 && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-black text-white shadow"
          >
            Imprimir
          </button>
        )}
      </header>

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
              <DunLabel data={d} />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
