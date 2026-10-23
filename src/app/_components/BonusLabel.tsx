"use client";

import dynamic from "next/dynamic";
import { getUnitsFromDescription } from "@/app/_utils/csvParser";
import type { BonusLabel as BonusLabelType } from "@/types/bonus";
import type { Layout, Orientation } from "./LabelSheet";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

type Props = {
  data: BonusLabelType;
  orientation?: Orientation;
  layout?: Layout;
};

// Mantém o fundo preto da faixa na impressão (navegadores removem fundos por padrão)
const printExact = "[print-color-adjust:exact] [-webkit-print-color-adjust:exact]";

export default function BonusLabel({
  data,
  orientation = "portrait",
  layout = "single",
}: Props) {
  const isLandscape = orientation === "landscape";
  const isDouble = layout === "double";
  const units = getUnitsFromDescription(data.product);

  // O SVG do código de barras é reduzido proporcionalmente para caber na
  // largura disponível, então áreas mais estreitas precisam de altura maior.
  const barcodeSize = isDouble
    ? isLandscape
      ? { height: 180, fontSize: 26 }
      : { height: 100, fontSize: 20 }
    : isLandscape
      ? { height: 280, fontSize: 32 }
      : { height: 150, fontSize: 22 };

  let containerClass;
  if (isDouble) {
    containerClass = isLandscape
      ? "w-[68mm] h-[96mm] p-[2mm] rounded-sm"
      : "w-[96mm] h-[68mm] p-[2mm] rounded-sm";
  } else {
    containerClass = `${
      isLandscape ? "w-[150mm] h-[100mm]" : "w-[100mm] h-[150mm]"
    } p-[4mm] border border-black rounded-md print:border-0`;
  }

  const banner = (
    <div
      className={`bg-black text-white text-center font-black tracking-wider leading-normal ${printExact} ${
        isDouble ? "text-lg" : isLandscape ? "text-3xl py-1" : "text-4xl py-1"
      }`}
    >
      BONIFICADO
    </div>
  );

  const product = (
    <div
      className={`font-bold leading-tight ${
        isDouble ? "mt-1 text-xs" : "mt-3 text-2xl"
      }`}
    >
      {data.product}
    </div>
  );

  const quantity = units !== null && (
    <div
      className={`flex items-center justify-center whitespace-nowrap border-y-2 border-black ${
        isDouble ? "mt-1 py-0.5 gap-2" : "mt-3 py-2 gap-3"
      } ${isLandscape && !isDouble ? "flex-col items-center" : ""}`}
    >
      <span className={`font-semibold ${isDouble ? "text-xs" : "text-xl"}`}>
        QTD/CAIXA:
      </span>
      <span className={`font-black ${isDouble ? "text-xl" : "text-5xl"}`}>
        {units} UN
      </span>
    </div>
  );

  const barcode = (
    <div className="grow flex items-center justify-center w-full min-h-0">
      <Barcode
        value={data.sku}
        format="CODE128"
        displayValue={true}
        background="#fff"
        lineColor="#000"
        width={2}
        height={barcodeSize.height}
        fontSize={barcodeSize.fontSize}
        margin={0}
        className="max-w-full h-auto"
      />
    </div>
  );

  // Paisagem em folha inteira: textos à esquerda, código de barras à direita.
  // Nos demais casos (inclusive meia folha), tudo empilhado.
  if (isLandscape && !isDouble) {
    return (
      <div
        data-pdf-frame
        className={`bg-white text-black ${containerClass} flex gap-4 select-none print:rounded-none`}
      >
        <div className="flex-1 flex flex-col">
          {banner}
          {product}
          {quantity}
        </div>
        <div className="flex-1 flex border-l border-black pl-4">{barcode}</div>
      </div>
    );
  }

  return (
    <div
      data-pdf-frame
      className={`bg-white text-black ${containerClass} flex flex-col select-none print:rounded-none`}
    >
      {banner}
      {product}
      {quantity}
      <div className={`grow flex ${isDouble ? "mt-1" : "mt-3"}`}>{barcode}</div>
    </div>
  );
}
