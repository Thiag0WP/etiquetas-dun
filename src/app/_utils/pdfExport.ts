import type jsPDFType from "jspdf";
import type html2canvasType from "html2canvas";

type Orientation = "portrait" | "landscape";
type Layout = "single" | "double";

/** Tamanho físico (mm) de cada página, igual ao usado nas classes CSS da etiqueta. */
function getPageSizeMM(orientation: Orientation, layout: Layout) {
  if (layout === "single") {
    return orientation === "landscape"
      ? { width: 150, height: 100 }
      : { width: 100, height: 150 };
  }
  return orientation === "landscape"
    ? { width: 140, height: 100 }
    : { width: 100, height: 140 };
}

const SCREEN_DPI = 96;
const EXPORT_DPI = 300;
const CAPTURE_SCALE = EXPORT_DPI / SCREEN_DPI;

/** Captura o nó DOM da etiqueta como PNG, no mesmo tamanho/aparência da impressão. */
async function captureLabelAsPNG(
  node: HTMLElement,
  html2canvas: typeof html2canvasType
): Promise<string> {
  const canvas = await html2canvas(node, {
    scale: CAPTURE_SCALE,
    backgroundColor: "#ffffff",
    useCORS: true,
    ignoreElements: (el) => el.hasAttribute("data-pdf-ignore"),
    onclone: (clonedDoc) => {
      // Remove borda/cantos arredondados (só existem para facilitar a
      // visualização em tela) para bater com o que sai na impressão.
      clonedDoc.querySelectorAll("[data-pdf-frame]").forEach((el) => {
        const style = (el as HTMLElement).style;
        style.border = "none";
        style.borderRadius = "0";
      });
    },
  });
  return canvas.toDataURL("image/png");
}

function makePdf(jsPDF: typeof jsPDFType, width: number, height: number) {
  const pageOrientation = width > height ? "l" : "p";
  return new jsPDF({
    orientation: pageOrientation,
    unit: "mm",
    format: [width, height],
  });
}

/**
 * Gera um PDF com uma página por etiqueta, no tamanho físico exato
 * (mesma unidade mm usada na tela), a partir dos nós DOM já renderizados.
 */
export async function exportLabelsToPDF(
  nodes: HTMLElement[],
  orientation: Orientation,
  layout: Layout,
  filename: string
): Promise<void> {
  if (nodes.length === 0) return;

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const { width, height } = getPageSizeMM(orientation, layout);
  const pageOrientation = width > height ? "l" : "p";
  const pdf = makePdf(jsPDF, width, height);

  for (let i = 0; i < nodes.length; i++) {
    const imgData = await captureLabelAsPNG(nodes[i], html2canvas);

    if (i > 0) {
      pdf.addPage([width, height], pageOrientation);
    }

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
  }

  pdf.save(filename);
}

/** Deixa o texto seguro para usar como nome de arquivo. */
function sanitizeFilename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_");
  return cleaned || "etiqueta";
}

export type ZipLabelItem = {
  element: HTMLElement;
  sku: string;
};

/**
 * Gera um .zip com um PDF separado por etiqueta, cada um no tamanho físico
 * exato e nomeado com o SKU da etiqueta (SKUs repetidos ganham sufixo -2, -3...).
 */
export async function exportLabelsToZip(
  items: ZipLabelItem[],
  orientation: Orientation,
  layout: Layout,
  zipFilename: string
): Promise<void> {
  if (items.length === 0) return;

  const [{ default: jsPDF }, { default: html2canvas }, { default: JSZip }] =
    await Promise.all([
      import("jspdf"),
      import("html2canvas"),
      import("jszip"),
    ]);

  const { width, height } = getPageSizeMM(orientation, layout);
  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  for (const { element, sku } of items) {
    const imgData = await captureLabelAsPNG(element, html2canvas);

    const pdf = makePdf(jsPDF, width, height);
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    const blob = pdf.output("blob");

    const baseName = sanitizeFilename(sku);
    const usedCount = usedNames.get(baseName) ?? 0;
    usedNames.set(baseName, usedCount + 1);
    const finalName = usedCount === 0 ? baseName : `${baseName}-${usedCount + 1}`;

    zip.file(`${finalName}.pdf`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipFilename;
  link.click();
  URL.revokeObjectURL(url);
}
