"use client";

import { useRef } from "react";
import DunLabelContainer from "@/app/_components/DunLabelContainer";
import { FileDropZone } from "@/app/_components/FileDropZone";
import { LoadingOverlay } from "@/app/_components/LoadingOverlay";
import { BackButton, WorkspaceControls } from "@/app/_components/WorkspaceControls";
import { ImportFeedbackPanel } from "@/app/_components/ImportFeedbackPanel";
import { WorkspaceActions } from "@/app/_components/WorkspaceActions";
import { LoadDialog } from "@/app/_components/LoadDialog";
import { ManualLabelForm } from "@/app/_components/ManualLabelForm";
import { useLabelWorkspace } from "@/app/_hooks/useLabelWorkspace";
import { exportToJSON, exportToCSV } from "@/app/_utils/labelStorage";

export default function PageCsv() {
  const {
    labels,
    orientation,
    setOrientation,
    layout,
    setLayout,
    savedSets,
    showLoadDialog,
    setShowLoadDialog,
    showManualDialog,
    setShowManualDialog,
    isLoading,
    loadingMessage,
    validationFeedback,
    handleCSV,
    handleDownloadPDF,
    handleDownloadZip,
    handleLoad,
    handleDelete,
    addLabel,
    removeLabel,
  } = useLabelWorkspace();

  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getZipItems = () =>
    labels
      .map((d, i) => ({ element: labelRefs.current[i], sku: d.sku }))
      .filter(
        (item): item is { element: HTMLDivElement; sku: string } =>
          item.element !== null
      );

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:bg-white relative">
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />

      <header className="print:hidden mb-4 space-y-3">
        <BackButton />

        <div className="space-y-4">
          <FileDropZone
            onFileSelect={handleCSV}
            disabled={isLoading}
            className="w-full"
          />

          <WorkspaceControls
            orientation={orientation}
            setOrientation={setOrientation}
            layout={layout}
            setLayout={setLayout}
            onAddManual={() => setShowManualDialog(true)}
          />
        </div>

        <ImportFeedbackPanel feedback={validationFeedback} />

        {labels.length > 0 && (
          <WorkspaceActions
            onPrint={() => window.print()}
            onDownloadPDF={() =>
              handleDownloadPDF(
                labelRefs.current.filter((el): el is HTMLDivElement => el !== null)
              )
            }
            onDownloadZip={() => handleDownloadZip(getZipItems())}
            onLoad={() => setShowLoadDialog(true)}
            onExportCSV={() => exportToCSV(labels)}
          />
        )}
      </header>

      <LoadDialog
        show={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        savedSets={savedSets}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onExportJSON={exportToJSON}
      />

      <ManualLabelForm
        show={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        onAdd={addLabel}
      />

      {labels.length === 0 ? (
        <p className="text-sm text-gray-600">
          Envie um arquivo CSV com as colunas: SKU, GTIN-14, Produto,
          QUANTIDADE POR CAIXA, ou clique em &quot;Adicionar Etiqueta
          Manualmente&quot; para criar sem CSV.
        </p>
      ) : (
        <section className="grid gap-8 print:gap-0">
          {labels.map((d, i) => (
            <div
              key={i}
              className="relative break-after-page print:break-after-page"
            >
              <button
                onClick={() => removeLabel(i)}
                title="Remover etiqueta"
                data-pdf-ignore
                className="print:hidden absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold shadow hover:bg-red-700"
              >
                ×
              </button>
              <DunLabelContainer
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                data={d}
                orientation={orientation}
                layout={layout}
              />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
