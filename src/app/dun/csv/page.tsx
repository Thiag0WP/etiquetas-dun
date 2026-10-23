"use client";

import DunLabel from "@/app/_components/DunLabel";
import { FileDropZone } from "@/app/_components/FileDropZone";
import { LoadingOverlay } from "@/app/_components/LoadingOverlay";
import { BackButton, WorkspaceControls } from "@/app/_components/WorkspaceControls";
import { ImportFeedbackPanel } from "@/app/_components/ImportFeedbackPanel";
import { WorkspaceActions } from "@/app/_components/WorkspaceActions";
import { ManualLabelForm } from "@/app/_components/ManualLabelForm";
import { LabelList } from "@/app/_components/LabelList";
import { useLabelWorkspace } from "@/app/_hooks/useLabelWorkspace";
import { parseLabelRows } from "@/app/_utils/csvParser";
import { validateDunLabel } from "@/app/_utils/validation";
import { exportToCSV } from "@/app/_utils/csvExport";
import { dunFormFields, dunFromForm } from "@/app/_utils/labelForms";

export default function PageCsv() {
  const {
    labels,
    labelRefs,
    orientation,
    setOrientation,
    layout,
    setLayout,
    showManualDialog,
    setShowManualDialog,
    isLoading,
    loadingMessage,
    validationFeedback,
    handleCSV,
    handleDownloadPDF,
    handleDownloadZip,
    addLabel,
    removeLabel,
  } = useLabelWorkspace({
    parseRows: parseLabelRows,
    validate: validateDunLabel,
  });

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:p-0 print:bg-white relative">
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
            onDownloadPDF={handleDownloadPDF}
            onDownloadZip={handleDownloadZip}
            onExportCSV={() =>
              exportToCSV(labels, ["sku", "gtin14", "product", "qtyPerBox"])
            }
          />
        )}
      </header>

      <ManualLabelForm
        show={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        onAdd={addLabel}
        fields={dunFormFields}
        toLabel={dunFromForm}
      />

      {labels.length === 0 ? (
        <p className="text-sm text-gray-600">
          Envie um arquivo CSV com as colunas: SKU, GTIN-14, Produto,
          QUANTIDADE POR CAIXA, ou clique em &quot;Adicionar Etiqueta
          Manualmente&quot; para criar sem CSV.
        </p>
      ) : (
        <LabelList
          labels={labels}
          labelRefs={labelRefs}
          orientation={orientation}
          layout={layout}
          onRemove={removeLabel}
          renderLabel={(d, l) => (
            <DunLabel data={d} orientation={orientation} layout={l} />
          )}
        />
      )}
    </main>
  );
}
