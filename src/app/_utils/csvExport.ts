/** Baixa as etiquetas como CSV, com as colunas na ordem informada. */
export function exportToCSV<T extends object>(
  labels: T[],
  columns: (keyof T & string)[]
): void {
  const rows = labels.map((label) =>
    columns.map((col) => String(label[col] ?? ""))
  );

  const csvContent = [
    columns.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `etiquetas-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Monta um link data: para baixar um CSV de exemplo. */
export function csvTemplateHref(columns: string[], example: string[]): string {
  const content = [columns.join(","), example.map((c) => `"${c}"`).join(",")].join("\n");
  return "data:text/csv;charset=utf-8," + encodeURIComponent(content);
}
