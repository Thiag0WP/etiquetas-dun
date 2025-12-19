"use client";

import dynamic from "next/dynamic";
import type { DunLabel } from "@/types/dun";
import { buildGS1Strings } from "@/app/_utils/gs1";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

type Props = {
  data: DunLabel;
  orientation?: "portrait" | "landscape";
  layout?: "single" | "double"; // Layout: 1 ou 2 etiquetas por folha
  showBoxSize?: boolean; // Mostrar tamanho da caixa
  showWeight?: boolean; // Mostrar peso da caixa
};

export default function DunLabel({
  data,
  orientation = "portrait",
  layout = "single",
  showBoxSize = true,
  showWeight = true,
}: Props) {
  // Ajustes finos (testar na sua Zebra e leitor)
  const itfWidth = 2.0,
    itfHeight = 120;
  const gs1Width = 2.0,
    gs1Height = 110;
  const skuWidth = 2.0,
    skuHeight = 90;

  const gs1 = buildGS1Strings({
    gtin14: data.gtin14,
  });

  const isLandscape = orientation === "landscape";
  const isDouble = layout === "double";

  // Classes para layout duplo (2 etiquetas idênticas por folha 100x150mm)
  const doublePortraitClass =
    "bg-white text-black w-[96mm] h-[68mm] p-[2mm] rounded-sm flex flex-col select-none print:rounded-none";
  const doubleLandscapeClass =
    "bg-white text-black w-[68mm] h-[96mm] p-[2mm] rounded-sm flex select-none print:rounded-none";

  // Classes para layout único (usa toda a folha 100x150mm)
  const singlePortraitClass =
    "bg-white text-black w-[100mm] h-[150mm] p-[4mm] border border-black rounded-md flex flex-col select-none print:rounded-none print:border-0";
  const singleLandscapeClass =
    "bg-white text-black w-[150mm] h-[100mm] p-[4mm] border border-black rounded-md flex select-none print:rounded-none print:border-0";

  let containerClass;
  if (isDouble) {
    containerClass = isLandscape ? doubleLandscapeClass : doublePortraitClass;
  } else {
    containerClass = isLandscape ? singleLandscapeClass : singlePortraitClass;
  }

  return (
    <div className={containerClass}>
      {isLandscape ? (
        <>
          {/* Layout Paisagem */}
          <div className="flex-1 flex flex-col pr-4">
            {/* Cabeçalho */}
            <div
              className={`${isDouble ? "" : "border border-black rounded"} ${
                isDouble ? "p-1" : "p-2"
              }`}
            >
              <div
                className={`font-bold tracking-wide leading-none text-black ${
                  isDouble ? "text-base" : "text-4xl"
                }`}
              >
                ETIQUETA DUN
              </div>
              <div
                className={`${isDouble ? "mt-0.5" : "mt-1"} text-black ${
                  isDouble ? "text-xs" : "text-xl"
                }`}
              >
                {data.product}
              </div>
            </div>

            {/* Infos */}
            <div
              className={`${isDouble ? "mt-1 pt-1" : "mt-2 pt-2"} ${
                isDouble ? "border-t border-black" : "border-t border-pink-500"
              } text-sm leading-tight flex-1`}
            >
              {isDouble ? (
                <div
                  className="text-black space-y-1"
                  style={{
                    fontSize: "0.7rem",
                  }}
                >
                  {/* Layout compacto para 2 etiquetas */}
                  <div className="flex justify-between items-center gap-1">
                    <div className="flex gap-1">
                      <span className="font-semibold text-black">GTIN-14:</span>
                      <span className="text-black">{data.gtin14}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold text-black">Qtd:</span>
                      <span className="text-black">{data.qtyPerBox}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <span className="font-semibold text-black">SKU:</span>
                    <span className="text-black">{data.sku}</span>
                  </div>
                </div>
              ) : (
                <div
                  className="grid gap-y-1 text-black"
                  style={{
                    gridTemplateColumns: "110px 1fr",
                    fontSize: "1.125rem",
                  }}
                >
                  {/* Layout tradicional para etiqueta única */}
                  <div className="font-semibold text-black">GTIN-14:</div>
                  <div className="text-black">{data.gtin14}</div>
                  <div className="font-semibold text-black">SKU:</div>
                  <div className="text-black">{data.sku}</div>
                  <div className="font-semibold text-black">Qtd/Caixa:</div>
                  <div className="text-black">{data.qtyPerBox}</div>
                  {showBoxSize && (
                    <>
                      <div className="font-semibold text-black">
                        Tam. Caixa:
                      </div>
                      <div className="text-black">{data.boxSize}</div>
                    </>
                  )}
                  {showWeight && (
                    <>
                      <div className="font-semibold text-black">Peso (kg):</div>
                      <div className="text-black">{data.weightKg}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Códigos de barras - lado direito */}
          <div
            className={`flex-1 ${isDouble ? "" : "border-l border-black"} ${
              isDouble ? "pl-1" : "pl-4"
            } flex flex-col items-center justify-center ${
              isDouble ? "gap-2" : "gap-3"
            }`}
          >
            <div className="w-full flex justify-center">
              <Barcode
                value={data.gtin14}
                format="CODE128"
                displayValue={true}
                background="#fff"
                lineColor="#000"
                width={itfWidth}
                height={isDouble ? 18 : 80}
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
                height={isDouble ? 18 : 80}
                margin={0}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Layout Retrato (original) */}
          {/* Cabeçalho */}
          <div
            className={`${isDouble ? "" : "border border-black rounded"} ${
              isDouble ? "p-1" : "p-2"
            }`}
          >
            <div
              className={`font-bold tracking-wide leading-none text-black ${
                isDouble ? "text-base" : "text-4xl"
              }`}
            >
              ETIQUETA DUN
            </div>
            <div
              className={`${isDouble ? "mt-0.5" : "mt-1"} text-black ${
                isDouble ? "text-xs" : "text-xl"
              }`}
            >
              {data.product}
            </div>
          </div>

          {/* Infos */}
          <div className="mt-3 pt-3 border-t border-black text-base leading-tight">
            {isDouble ? (
              <div
                className="text-black space-y-2"
                style={{
                  fontSize: "0.875rem",
                }}
              >
                {/* GTIN-14 e Qtd/Caixa na mesma linha para layout duplo */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex gap-2">
                    <span className="font-semibold text-black">GTIN-14:</span>
                    <span className="text-black">{data.gtin14}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-black">Qtd/Caixa:</span>
                    <span className="text-black">{data.qtyPerBox}</span>
                  </div>
                </div>

                {/* SKU embaixo */}
                <div className="flex gap-2">
                  <span className="font-semibold text-black">SKU:</span>
                  <span className="text-black">{data.sku}</span>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-y-1 text-black"
                style={{
                  gridTemplateColumns: "140px 1fr",
                  fontSize: "1.25rem",
                }}
              >
                {/* Layout tradicional para etiqueta única */}
                <div className="font-semibold text-black">GTIN-14:</div>
                <div className="text-black">{data.gtin14}</div>
                <div className="font-semibold text-black">SKU:</div>
                <div className="text-black">{data.sku}</div>
                <div className="font-semibold text-black">Qtd/Caixa:</div>
                <div className="text-black">{data.qtyPerBox}</div>
                {showBoxSize && (
                  <>
                    <div className="font-semibold text-black">Tam. Caixa:</div>
                    <div className="text-black">{data.boxSize}</div>
                  </>
                )}
                {showWeight && (
                  <>
                    <div className="font-semibold text-black">Peso (kg):</div>
                    <div className="text-black">{data.weightKg}</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Códigos de barras */}
          <div
            className={`${isDouble ? "mt-1" : "mt-3"} ${
              isDouble ? "" : "border border-black"
            } ${
              isDouble ? "p-1" : "p-2"
            } grow flex flex-col items-center justify-center ${
              isDouble ? "gap-2" : "gap-4"
            }`}
          >
            {/* ITF-14 grande (GTIN-14) */}
            <div className="w-full flex justify-center">
              <Barcode
                value={data.gtin14}
                format="CODE128"
                displayValue={true}
                background="#fff"
                lineColor="#000"
                width={itfWidth}
                height={isDouble ? 18 : 90}
                margin={0}
              />
            </div>

            {/* SKU separado em Code128 (interno) */}
            <div className="w-full flex justify-center">
              <Barcode
                value={data.sku}
                format="CODE128"
                displayValue={true}
                background="#fff"
                lineColor="#000"
                width={skuWidth}
                height={isDouble ? 18 : 80}
                margin={0}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
