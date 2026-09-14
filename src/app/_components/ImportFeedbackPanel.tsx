"use client";

import type { ImportFeedback } from "@/app/_hooks/useLabelWorkspace";

type Props = {
  feedback: ImportFeedback | null;
};

export function ImportFeedbackPanel({ feedback }: Props) {
  if (!feedback) return null;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Resultado da Importação</h3>
      <div className="flex gap-6 mb-3">
        <div className="text-green-600">
          ✓ {feedback.validCount} etiquetas válidas
        </div>
        {feedback.invalidCount > 0 && (
          <div className="text-red-600">
            ✗ {feedback.invalidCount} etiquetas com problemas
          </div>
        )}
      </div>

      {feedback.invalidLabels.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-red-700 font-medium hover:text-red-800">
            Ver problemas detectados
          </summary>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {feedback.invalidLabels.map((label, idx) => (
              <div
                key={idx}
                className="border-l-4 border-red-400 pl-3 py-2 bg-red-50"
              >
                <div className="font-medium text-red-800">
                  SKU: {label.sku || "N/A"} | GTIN: {label.gtin14 || "N/A"}
                </div>
                <div className="text-red-600 text-xs">
                  {label.errors.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
