"use client";

import BonusLabel from "@/app/_components/BonusLabel";
import { FileDropZone } from "@/app/_components/FileDropZone";
import { LoadingOverlay } from "@/app/_components/LoadingOverlay";
import { BackButton, WorkspaceControls } from "@/app/_components/WorkspaceControls";
import { ImportFeedbackPanel } from "@/app/_components/ImportFeedbackPanel";
import { WorkspaceActions } from "@/app/_components/WorkspaceActions";
import { ManualLabelForm } from "@/app/_components/ManualLabelForm";
import { LabelList } from "@/app/_components/LabelList";
import { useLabelWorkspace } from "@/app/_hooks/useLabelWorkspace";
import { parseBonusRows } from "@/app/_utils/csvParser";
import { validateBonusLabel } from "@/app/_utils/validation";
import { csvTemplateHref, exportToCSV } from "@/app/_utils/csvExport";
import { bonusFormFields, bonusFromForm } from "@/app/_utils/labelForms";
import { bonusSample } from "@/data/bonus";

const bonusColumns = ["sku", "product"] as const;

export default function PageBonificado() {
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
    initialLabels: [bonusSample],
    parseRows: parseBonusRows,
    validate: validateBonusLabel,
    zipFileName: (label) => label.product,
  });

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 print:p-0 print:bg-white relative">
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />

      <div className="mx-auto max-w-[230mm]">
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

          <WorkspaceActions
            onPrint={() => window.print()}
            onDownloadPDF={handleDownloadPDF}
            onDownloadZip={handleDownloadZip}
            zipLabel="Baixar ZIP (PDF por DUN)"
            onExportCSV={() => exportToCSV(labels, [...bonusColumns])}
            extra={
              <a
                href={csvTemplateHref(
                  [...bonusColumns],
                  [bonusSample.sku, bonusSample.product]
                )}
                download="modelo_bonificado.csv"
                className="underline text-blue-700"
              >
                Baixar modelo CSV
              </a>
            }
          />
        </header>

        <ManualLabelForm
          show={showManualDialog}
          onClose={() => setShowManualDialog(false)}
          onAdd={addLabel}
          fields={bonusFormFields}
          toLabel={bonusFromForm}
        />

        {labels.length === 0 ? (
          <p className="text-sm text-gray-600">
            Envie um arquivo CSV com as colunas: sku, product (descrição), ou
            clique em &quot;Adicionar Etiqueta Manualmente&quot;. A quantidade
            é lida da descrição (ex.: &quot;DUN 12un&quot;).
          </p>
        ) : (
          <LabelList
            labels={labels}
            labelRefs={labelRefs}
            orientation={orientation}
            layout={layout}
            onRemove={removeLabel}
            renderLabel={(d, l) => (
              <BonusLabel data={d} orientation={orientation} layout={l} />
            )}
          />
        )}
      </div>
    </main>
  );
}
