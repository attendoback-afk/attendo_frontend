"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePreviewTable } from "@/components/bulk-upload/file-preview-table";

export type PreviewRow<T extends Record<string, unknown>> = {
  index: number;
  values: T;
  errors: string[];
};

type BulkUploadModalProps<T extends Record<string, unknown>> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  expectedColumns: string[];
  columns: Array<{ key: keyof T; label: string }>;
  buildPreview: (rows: Record<string, unknown>[]) => Promise<PreviewRow<T>[]> | PreviewRow<T>[];
  onConfirm: (rows: T[]) => Promise<void> | void;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

export function BulkUploadModal<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  expectedColumns,
  columns,
  buildPreview,
  onConfirm,
}: BulkUploadModalProps<T>) {
  const [previewRows, setPreviewRows] = useState<PreviewRow<T>[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const validRows = useMemo(
    () => previewRows.filter((row) => row.errors.length === 0).map((row) => row.values),
    [previewRows],
  );
  const hasValidationErrors = previewRows.some((row) => row.errors.length > 0);

  const resetState = () => {
    setPreviewRows([]);
    setSelectedFileName("");
    setParseError(null);
    setIsParsing(false);
    setIsConfirming(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetState();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setSelectedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("The uploaded file does not contain any sheets.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
      });
      const normalizedRows = rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
        ),
      );

      const preview = await buildPreview(normalizedRows);
      setPreviewRows(preview);
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : "Unable to read the uploaded spreadsheet.",
      );
      setPreviewRows([]);
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await onConfirm(validRows);
      handleOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 rounded-lg border border-dashed border-border p-4">
            <p className="text-sm font-medium text-foreground">
              Expected columns: {expectedColumns.join(", ")}
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            />
            {selectedFileName ? (
              <p className="text-sm text-muted-foreground">Selected file: {selectedFileName}</p>
            ) : null}
            {parseError ? <p className="text-sm text-destructive">{parseError}</p> : null}
            {isParsing ? <p className="text-sm text-muted-foreground">Preparing preview...</p> : null}
          </div>

          {previewRows.length ? <FilePreviewTable columns={columns} rows={previewRows} /> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-lg" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            onClick={handleConfirm}
            disabled={!validRows.length || hasValidationErrors || isConfirming || isParsing}
          >
            {isConfirming ? "Importing..." : `Import ${validRows.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
