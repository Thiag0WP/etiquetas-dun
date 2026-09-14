"use client";

import { forwardRef } from "react";
import DunLabel from "./DunLabel";
import type { DunLabel as DunLabelType } from "@/types/dun";

type Props = {
  data: DunLabelType;
  orientation?: "portrait" | "landscape";
  layout?: "single" | "double";
};

/**
 * Ref encaminhado para o nó raiz cujo tamanho em tela corresponde exatamente
 * ao tamanho físico da página (usado para exportação em PDF).
 */
const DunLabelContainer = forwardRef<HTMLDivElement, Props>(
  function DunLabelContainer(
    { data, orientation = "portrait", layout = "single" },
    ref
  ) {
    if (layout === "single") {
      return (
        <DunLabel ref={ref} data={data} orientation={orientation} layout="single" />
      );
    }

    // Layout duplo: 2 etiquetas idênticas por folha 100x150mm
    const containerClass =
      orientation === "landscape"
        ? "w-[140mm] h-[100mm] flex flex-row gap-[2mm] justify-center items-center" // Lado a lado centralizadas
        : "w-[100mm] h-[140mm] flex flex-col gap-[2mm] justify-center items-center"; // Uma embaixo da outra centralizadas

    return (
      <div
        ref={ref}
        className={`${containerClass} page-break-after-always print:page-break-after-always`}
      >
        <DunLabel data={data} orientation={orientation} layout="double" />
        <DunLabel data={data} orientation={orientation} layout="double" />
      </div>
    );
  }
);

export default DunLabelContainer;
