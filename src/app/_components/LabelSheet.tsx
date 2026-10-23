"use client";

import { forwardRef, type ReactNode } from "react";

export type Orientation = "portrait" | "landscape";
export type Layout = "single" | "double";

type Props = {
  orientation: Orientation;
  layout: Layout;
  /** Renderiza uma etiqueta no tamanho do layout (inteira ou meia folha). */
  renderLabel: (layout: Layout) => ReactNode;
};

// Tamanho físico de cada folha, igual ao usado em pdfExport.getPageSizeMM
const sheetClass: Record<Layout, Record<Orientation, string>> = {
  single: {
    portrait: "w-[100mm] h-[150mm]",
    landscape: "w-[150mm] h-[100mm]",
  },
  double: {
    // Uma embaixo da outra / lado a lado, centralizadas
    portrait:
      "w-[100mm] h-[140mm] flex flex-col gap-[2mm] justify-center items-center",
    landscape:
      "w-[140mm] h-[100mm] flex flex-row gap-[2mm] justify-center items-center",
  },
};

/**
 * Folha de etiqueta. O ref é encaminhado para o nó raiz, cujo tamanho em tela
 * corresponde exatamente ao tamanho físico da página (usado na exportação em PDF).
 */
const LabelSheet = forwardRef<HTMLDivElement, Props>(function LabelSheet(
  { orientation, layout, renderLabel },
  ref
) {
  return (
    <div ref={ref} className={sheetClass[layout][orientation]}>
      {renderLabel(layout)}
      {/* Layout duplo: 2 etiquetas idênticas por folha */}
      {layout === "double" && renderLabel(layout)}
    </div>
  );
});

export default LabelSheet;
