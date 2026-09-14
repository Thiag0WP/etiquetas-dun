"use client";

type Props = {
  orientation: "portrait" | "landscape";
  setOrientation: (o: "portrait" | "landscape") => void;
  layout: "single" | "double";
  setLayout: (l: "single" | "double") => void;
  onAddManual: () => void;
};

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${
        active ? "bg-black text-white" : "bg-gray-300 text-black"
      }`}
    >
      {children}
    </button>
  );
}

export function BackButton() {
  return (
    <div className="mb-4">
      <a
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Voltar para Início
      </a>
    </div>
  );
}

export function WorkspaceControls({
  orientation,
  setOrientation,
  layout,
  setLayout,
  onAddManual,
}: Props) {
  return (
    <>
      <div className="flex gap-2 items-center">
        <label className="text-sm font-semibold">Orientação:</label>
        <ToggleButton
          active={orientation === "portrait"}
          onClick={() => setOrientation("portrait")}
        >
          Retrato
        </ToggleButton>
        <ToggleButton
          active={orientation === "landscape"}
          onClick={() => setOrientation("landscape")}
        >
          Paisagem
        </ToggleButton>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-semibold">Layout:</label>
        <ToggleButton
          active={layout === "single"}
          onClick={() => setLayout("single")}
        >
          1 Etiqueta
        </ToggleButton>
        <ToggleButton
          active={layout === "double"}
          onClick={() => setLayout("double")}
        >
          2 Etiquetas
        </ToggleButton>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={onAddManual}
          className="px-3 py-1 rounded bg-orange-500 text-white font-semibold"
        >
          + Adicionar Etiqueta Manualmente
        </button>
      </div>
    </>
  );
}
