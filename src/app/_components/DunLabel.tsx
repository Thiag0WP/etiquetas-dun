"use client";

import dynamic from "next/dynamic";
import type { DunLabel } from "@/types/dun";
import { buildGS1Strings } from "@/app/_utils/gs1";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

type Props = { data: DunLabel };

export default function DunLabel({ data }: Props) {
  // Ajustes finos (testar na sua Zebra e leitor)
  const itfWidth = 2.0,
    itfHeight = 120;
  const gs1Width = 2.0,
    gs1Height = 110;
  const skuWidth = 2.0,
    skuHeight = 90;

  const gs1 = buildGS1Strings({
    gtin14: data.gtin14,
    lot: data.lot,
    expiry: data.expiry,
  });

  return (
    <div className="bg-white text-black w-[100mm] h-[150mm] p-[6mm] border border-black rounded-md flex flex-col select-none print:rounded-none print:border-0">
      {/* Cabeçalho */}
      <div className="border border-black rounded p-2">
        <div className="text-3xl font-bold tracking-wide leading-none">
          ETIQUETA DUN
        </div>
        <div className="text-lg mt-1">{data.product}</div>
      </div>

      {/* Infos */}
      <div className="mt-3 pt-3 border-t border-black text-base leading-tight">
        <div className="grid grid-cols-[140px_1fr] gap-y-1">
          <div className="font-semibold">GTIN-14:</div>
          <div>{data.gtin14}</div>
          <div className="font-semibold">SKU:</div>
          <div>{data.sku}</div>
          <div className="font-semibold">Qtd/Caixa:</div>
          <div>{data.qtyPerBox}</div>
          <div className="font-semibold">Tam. Caixa:</div>
          <div>{data.boxSize}</div>
          <div className="font-semibold">Peso (kg):</div>
          <div>{data.weightKg}</div>
          {data.lot && (
            <>
              <div className="font-semibold">Lote (10):</div>
              <div>{data.lot}</div>
            </>
          )}
          {data.expiry && (
            <>
              <div className="font-semibold">Validade (17):</div>
              <div>{data.expiry}</div>
            </>
          )}
        </div>
      </div>

      {/* Códigos de barras */}
      <div className="mt-3 border border-black p-2 grow flex flex-col items-center justify-center gap-4">
        {/* ITF-14 grande (GTIN-14) */}
        <div className="w-full h-10 flex justify-center">
          <Barcode
            value={data.gtin14}
            format="CODE128"
            displayValue={true}
            background="#fff"
            lineColor="#000"
            width={itfWidth}
            height={68}
            margin={0}
          />
        </div>

        {/* SKU separado em Code128 (interno) */}
        <div className="w-[85%] pt-15 flex justify-center">
          <Barcode
            value={data.sku}
            format="CODE128"
            displayValue={true}
            background="#fff"
            lineColor="#000"
            width={skuWidth}
            height={80}
            margin={0}
          />
        </div>
      </div>
    </div>
  );
}
