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

  const pdf = new jsPDF({
    orientation: pageOrientation,
    unit: "mm",
    format: [width, height],
  });

  for (let i = 0; i < nodes.length; i++) {
    const canvas = await html2canvas(nodes[i], {
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

    if (i > 0) {
      pdf.addPage([width, height], pageOrientation);
    }

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
  }

  pdf.save(filename);
}
