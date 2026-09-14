"use client";

import DunLabelContainer from "@/app/_components/DunLabelContainer";
import { FileDropZone } from "@/app/_components/FileDropZone";
import { LoadingOverlay } from "@/app/_components/LoadingOverlay";
import { BackButton, WorkspaceControls } from "@/app/_components/WorkspaceControls";
import { ImportFeedbackPanel } from "@/app/_components/ImportFeedbackPanel";
import { WorkspaceActions } from "@/app/_components/WorkspaceActions";
import { SaveDialog, LoadDialog } from "@/app/_components/SaveLoadDialogs";
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
    showSaveDialog,
    setShowSaveDialog,
    showLoadDialog,
    setShowLoadDialog,
    showManualDialog,
    setShowManualDialog,
    saveName,
    setSaveName,
    isLoading,
    loadingMessage,
    validationFeedback,
    handleCSV,
    handleSave,
    handleLoad,
    handleDelete,
    addLabel,
    removeLabel,
  } = useLabelWorkspace();

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
            onSave={() => setShowSaveDialog(true)}
            onLoad={() => setShowLoadDialog(true)}
            onExportCSV={() => exportToCSV(labels)}
          />
        )}
      </header>

      <SaveDialog
        show={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        saveName={saveName}
        setSaveName={setSaveName}
        onSave={handleSave}
      />

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
                className="print:hidden absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold shadow hover:bg-red-700"
              >
                ×
              </button>
              <DunLabelContainer data={d} orientation={orientation} layout={layout} />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
