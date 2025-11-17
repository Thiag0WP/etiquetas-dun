"use client";

import dynamic from "next/dynamic";
import type { DunLabel } from "@/types/dun";
import { buildGS1Strings } from "@/app/_utils/gs1";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

type Props = {
  data: DunLabel;
  orientation?: "portrait" | "landscape";
};

export default function DunLabel({ data, orientation = "portrait" }: Props) {
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

  const isLandscape = orientation === "landscape";
  const containerClass = isLandscape
    ? "bg-white text-black w-[150mm] h-[100mm] p-[6mm] border border-black rounded-md flex select-none print:rounded-none print:border-0"
    : "bg-white text-black w-[100mm] h-[150mm] p-[6mm] border border-black rounded-md flex flex-col select-none print:rounded-none print:border-0";

  return (
    <div className={containerClass}>
      {isLandscape ? (
        <>
          {/* Layout Paisagem */}
          <div className="flex-1 flex flex-col pr-4">
            {/* Cabeçalho */}
            <div className="border border-black rounded p-2">
              <div className="text-2xl font-bold tracking-wide leading-none text-black">
                ETIQUETA DUN
              </div>
              <div className="text-base mt-1 text-black">{data.product}</div>
            </div>

            {/* Infos */}
            <div className="mt-2 pt-2 border-t border-black text-sm leading-tight flex-1">
              <div className="grid grid-cols-[110px_1fr] gap-y-1 text-black">
                <div className="font-semibold text-black">GTIN-14:</div>
                <div className="text-black">{data.gtin14}</div>
                <div className="font-semibold text-black">SKU:</div>
                <div className="text-black">{data.sku}</div>
                <div className="font-semibold text-black">Qtd/Caixa:</div>
                <div className="text-black">{data.qtyPerBox}</div>
                <div className="font-semibold text-black">Tam. Caixa:</div>
                <div className="text-black">{data.boxSize}</div>
                <div className="font-semibold text-black">Peso (kg):</div>
                <div className="text-black">{data.weightKg}</div>
                {data.lot && (
                  <>
                    <div className="font-semibold text-black">Lote (10):</div>
                    <div className="text-black">{data.lot}</div>
                  </>
                )}
                {data.expiry && (
                  <>
                    <div className="font-semibold text-black">
                      Validade (17):
                    </div>
                    <div className="text-black">{data.expiry}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Códigos de barras - lado direito */}
          <div className="flex-1 border-l border-black pl-4 flex flex-col items-center justify-center gap-3">
            <div className="w-full flex justify-center">
              <Barcode
                value={data.gtin14}
                format="CODE128"
                displayValue={true}
                background="#fff"
                lineColor="#000"
                width={itfWidth}
                height={60}
                margin={0}
              />
            </div>
            <div className="w-full flex justify-center">
              <Barcode
                value={data.sku}
                format="CODE128"
                displayValue={true}
                background="#fff"
                lineColor="#000"
                width={skuWidth}
                height={60}
                margin={0}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Layout Retrato (original) */}
          {/* Cabeçalho */}
          <div className="border border-black rounded p-2">
            <div className="text-3xl font-bold tracking-wide leading-none text-black">
              ETIQUETA DUN
            </div>
            <div className="text-lg mt-1 text-black">{data.product}</div>
          </div>

          {/* Infos */}
          <div className="mt-3 pt-3 border-t border-black text-base leading-tight">
            <div className="grid grid-cols-[140px_1fr] gap-y-1 text-black">
              <div className="font-semibold text-black">GTIN-14:</div>
              <div className="text-black">{data.gtin14}</div>
              <div className="font-semibold text-black">SKU:</div>
              <div className="text-black">{data.sku}</div>
              <div className="font-semibold text-black">Qtd/Caixa:</div>
              <div className="text-black">{data.qtyPerBox}</div>
              <div className="font-semibold text-black">Tam. Caixa:</div>
              <div className="text-black">{data.boxSize}</div>
              <div className="font-semibold text-black">Peso (kg):</div>
              <div className="text-black">{data.weightKg}</div>
              {data.lot && (
                <>
                  <div className="font-semibold text-black">Lote (10):</div>
                  <div className="text-black">{data.lot}</div>
                </>
              )}
              {data.expiry && (
                <>
                  <div className="font-semibold text-black">Validade (17):</div>
                  <div className="text-black">{data.expiry}</div>
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
        </>
      )}
    </div>
  );
}
