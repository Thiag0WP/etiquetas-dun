"use client";

import DunLabel from "./DunLabel";
import type { DunLabel as DunLabelType } from "@/types/dun";

type Props = {
  data: DunLabelType;
  orientation?: "portrait" | "landscape";
  layout?: "single" | "double";
};

export default function DunLabelContainer({
  data,
  orientation = "portrait",
  layout = "single",
}: Props) {
  if (layout === "single") {
    return <DunLabel data={data} orientation={orientation} layout="single" />;
  }

  // Layout duplo: 2 etiquetas idênticas por folha 100x150mm
  const containerClass =
    orientation === "landscape"
      ? "w-[140mm] h-[100mm] flex flex-row gap-[2mm] justify-center items-center" // Lado a lado centralizadas
      : "w-[100mm] h-[140mm] flex flex-col gap-[2mm] justify-center items-center"; // Uma embaixo da outra centralizadas

  return (
    <div
      className={`${containerClass} page-break-after-always print:page-break-after-always`}
    >
      <DunLabel data={data} orientation={orientation} layout="double" />
      <DunLabel data={data} orientation={orientation} layout="double" />
    </div>
  );
}
