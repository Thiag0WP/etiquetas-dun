"use client";

import { useMemo, useState } from "react";
import DunLabelComponent from "@/app/_components/DunLabel";
import type { DunLabel } from "@/types/dun";
import { dunSample } from "@/data/dun";
import Papa from "papaparse";

export default function PageGS1() {
  const [labels, setLabels] = useState<DunLabel[]>([dunSample]);

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

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:bg-white">
      <div className="mx-auto max-w-[230mm]">
        <header className="print:hidden mb-4 flex items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleCSV(f);
            }}
            className="block"
          />
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-black text-white shadow"
          >
            Imprimir
          </button>
          <a
            href="data:text/csv;charset=utf-8,sku,gtin14,product,qtyPerBox,boxSize,weightKg,lot,expiry%0A\
D24-ALV26278,27898971826272,Pasta de Dente Relax - Limão e Canela Vegano Alva 90g,24,32X25X16,3,095,L2409-A,2026-03-31"
            download="modelo_dun.csv"
            className="ml-2 underline text-blue-700"
          >
            Baixar modelo CSV
          </a>
        </header>

        <section className={`grid ${gridCols} gap-8 print:gap-0`}>
          {labels.map((d, i) => (
            <div key={i} className="break-after-page print:break-after-page">
              <DunLabelComponent data={d} />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
