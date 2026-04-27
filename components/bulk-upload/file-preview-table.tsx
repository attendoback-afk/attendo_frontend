"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PreviewColumn<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
};

type PreviewRow<T extends Record<string, unknown>> = {
  index: number;
  values: T;
  errors: string[];
};

export function FilePreviewTable<T extends Record<string, unknown>>({
  columns,
  rows,
}: {
  columns: PreviewColumn<T>[];
  rows: PreviewRow<T>[];
}) {
  return (
    <div className="dashboard-panel overflow-hidden">
      <Table>
        <TableHeader className="bg-[#fcfbff]">
          <TableRow>
            <TableHead className="w-[72px]">Row</TableHead>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>{column.label}</TableHead>
            ))}
            <TableHead>Validation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`preview-${row.index}`}>
              <TableCell>{row.index}</TableCell>
              {columns.map((column) => (
                <TableCell key={`${row.index}-${String(column.key)}`}>
                  {String(row.values[column.key] ?? "-")}
                </TableCell>
              ))}
              <TableCell className={row.errors.length ? "text-destructive" : "text-foreground"}>
                {row.errors.length ? row.errors.join(", ") : "Ready"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
