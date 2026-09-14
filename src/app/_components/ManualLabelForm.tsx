"use client";

import { useState } from "react";
import type { DunLabel } from "@/types/dun";

type Props = {
  show: boolean;
  onClose: () => void;
  onAdd: (label: DunLabel) => boolean;
};

const emptyForm = { sku: "", gtin14: "", product: "", qtyPerBox: "" };

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

export function ManualLabelForm({ show, onClose, onAdd }: Props) {
  const [form, setForm] = useState(emptyForm);

  if (!show) return null;

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleAdd = () => {
    const added = onAdd({
      sku: form.sku.trim(),
      gtin14: form.gtin14.trim(),
      product: form.product.trim(),
      qtyPerBox: Number(form.qtyPerBox.toString().replace(",", ".")) || 0,
    });
    if (added) {
      setForm(emptyForm);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-black">
          Adicionar Etiqueta
        </h2>
        <div className="space-y-3">
          <Field
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="D24-ALV26278"
          />
          <Field
            label="GTIN-14"
            value={form.gtin14}
            onChange={(e) => setForm({ ...form, gtin14: e.target.value })}
            placeholder="14 dígitos"
            inputMode="numeric"
          />
          <Field
            label="Produto"
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            placeholder="Nome do produto"
          />
          <Field
            label="Qtd/Caixa"
            type="number"
            min="1"
            value={form.qtyPerBox}
            onChange={(e) => setForm({ ...form, qtyPerBox: e.target.value })}
            placeholder="24"
          />
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
