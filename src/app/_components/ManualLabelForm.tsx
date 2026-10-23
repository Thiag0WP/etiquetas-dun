"use client";

import { useState } from "react";

export type FormField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

type Props<T> = {
  show: boolean;
  onClose: () => void;
  onAdd: (label: T) => boolean;
  fields: FormField[];
  /** Converte os valores digitados (já sem espaços nas pontas) na etiqueta. */
  toLabel: (values: Record<string, string>) => T;
};

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-semibold text-black block mb-1">
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full px-3 py-2 border border-gray-300 rounded text-black placeholder:text-gray-500"
      />
    </div>
  );
}

export function ManualLabelForm<T>({
  show,
  onClose,
  onAdd,
  fields,
  toLabel,
}: Props<T>) {
  const emptyForm = () =>
    Object.fromEntries(fields.map((f) => [f.key, ""])) as Record<string, string>;
  const [form, setForm] = useState(emptyForm);

  if (!show) return null;

  const handleClose = () => {
    setForm(emptyForm());
    onClose();
  };

  const handleAdd = () => {
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    );
    if (onAdd(toLabel(trimmed))) {
      setForm(emptyForm());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-black">
          Adicionar Etiqueta
        </h2>
        <div className="space-y-3">
          {fields.map(({ key, ...field }) => (
            <Field
              key={key}
              {...field}
              value={form[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded bg-gray-300 text-black"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
