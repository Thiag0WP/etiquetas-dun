import type { DunLabel } from "@/types/dun";

export interface SavedLabelSet {
  id: string;
  name: string;
  labels: DunLabel[];
  createdAt: string;
  orientation?: "portrait" | "landscape";
}

const STORAGE_KEY = "dun-saved-labels";

export function saveLabelSet(name: string, labels: DunLabel[], orientation: "portrait" | "landscape" = "portrait"): SavedLabelSet {
  const savedSets = getSavedLabelSets();
  const newSet: SavedLabelSet = {
    id: Date.now().toString(),
    name,
    labels,
    createdAt: new Date().toISOString(),
    orientation,
  };
  
  savedSets.push(newSet);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSets));
  
  return newSet;
}

export function getSavedLabelSets(): SavedLabelSet[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteLabelSet(id: string): void {
  const savedSets = getSavedLabelSets();
  const filtered = savedSets.filter((set) => set.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function exportToJSON(labelSet: SavedLabelSet): void {
  const dataStr = JSON.stringify(labelSet, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `etiquetas-${labelSet.name}-${labelSet.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(labels: DunLabel[]): void {
  const headers = ["sku", "gtin14", "product", "qtyPerBox", "boxSize", "weightKg", "lot", "expiry"];
  const rows = labels.map((label) => [
    label.sku,
    label.gtin14,
    label.product,
    label.qtyPerBox.toString(),
    label.boxSize,
    label.weightKg,
    label.lot || "",
    label.expiry || "",
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `etiquetas-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
