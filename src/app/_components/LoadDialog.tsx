"use client";

import type { SavedLabelSet } from "@/app/_utils/labelStorage";

type LoadDialogProps = {
  show: boolean;
  onClose: () => void;
  savedSets: SavedLabelSet[];
  onLoad: (set: SavedLabelSet) => void;
  onDelete: (id: string) => void;
  onExportJSON: (set: SavedLabelSet) => void;
};

export function LoadDialog({
  show,
  onClose,
  savedSets,
  onLoad,
  onDelete,
  onExportJSON,
}: LoadDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black">
          Etiquetas Salvas
        </h2>
        {savedSets.length === 0 ? (
          <p className="text-gray-600">Nenhuma etiqueta salva ainda.</p>
        ) : (
          <div className="space-y-3">
            {savedSets.map((set) => (
              <div
                key={set.id}
                className="border border-gray-300 rounded p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-black">{set.name}</h3>
                  <p className="text-sm text-gray-600">
                    {set.labels.length} etiqueta(s) •{" "}
                    {set.orientation === "landscape" ? "Paisagem" : "Retrato"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(set.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoad(set)}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    Carregar
                  </button>
                  <button
                    onClick={() => onExportJSON(set)}
                    className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => onDelete(set.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 text-black"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
