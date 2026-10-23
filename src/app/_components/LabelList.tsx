"use client";

import type { ReactNode, RefObject } from "react";
import LabelSheet, { type Layout, type Orientation } from "./LabelSheet";

type Props<T> = {
  labels: T[];
  labelRefs: RefObject<(HTMLDivElement | null)[]>;
  orientation: Orientation;
  layout: Layout;
  onRemove: (index: number) => void;
  renderLabel: (label: T, layout: Layout) => ReactNode;
};

/** Lista de folhas de etiqueta, uma por página na impressão, com botão de remover. */
export function LabelList<T>({
  labels,
  labelRefs,
  orientation,
  layout,
  onRemove,
  renderLabel,
}: Props<T>) {
  return (
    <section className="grid grid-cols-1 gap-8 print:gap-0">
      {labels.map((label, i) => (
        <div
          key={i}
          className="relative w-fit break-after-page last:break-after-auto"
        >
          <button
            onClick={() => onRemove(i)}
            title="Remover etiqueta"
            data-pdf-ignore
            className="print:hidden absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold shadow hover:bg-red-700"
          >
            ×
          </button>
          <LabelSheet
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            orientation={orientation}
            layout={layout}
            renderLabel={(l) => renderLabel(label, l)}
          />
        </div>
      ))}
    </section>
  );
}
