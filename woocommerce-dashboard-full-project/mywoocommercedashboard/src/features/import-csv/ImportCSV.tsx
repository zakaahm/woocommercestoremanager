// src/features/import-csv/ImportCSV.tsx

import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  TextField
} from "@mui/material";
import Papa from "papaparse";
import { useState } from "react";
import { useCreateProduct } from "../../api/products";
import { Product } from "../../types/product";
import { formatHtml } from "../../utils/helpers";

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [importing, setImporting] = useState(false);
  const { mutateAsync } = useCreateProduct();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    setErrors([]);
    setRows([]);
    if (selected) {
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const data = result.data as any[];
          const preview = data.slice(0, 10).map(mapRowToProduct);
          setRows(preview);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setErrors([]);
    setProgress(0);

    await new Promise<void>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          const data = result.data as any[];
          const batchSize = 5;
          let successCount = 0;
          let failCount = 0;

          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize).map(mapRowToProduct);
            await Promise.all(
              batch.map(async (item) => {
                try {
                  if (!item.name) throw new Error("Naam verplicht");
                  await mutateAsync(item);
                  successCount++;
                } catch (e) {
                  failCount++;
                }
              })
            );
            setProgress(Math.round(((i + batchSize) / data.length) * 100));
          }

          setErrors([
            `✅ ${successCount} producten geïmporteerd`,
            failCount > 0 ? `❌ ${failCount} fouten` : ""
          ]);
          resolve();
        }
      });
    });

    setImporting(false);
  };

  const mapRowToProduct = (row: any): Partial<Product> => {
    const attributes: any[] = [];

    Object.keys(row).forEach((col) => {
      const isAttr =
        col.toLowerCase().includes("attribuut") &&
        col.toLowerCase().includes("naam");

      if (isAttr && row[col]) {
        const attrName = row[col];
        const valueCol = col.replace("naam", "waarde(n)");
        const rawValues = row[valueCol];
        if (rawValues) {
          const options = rawValues.split("|").map((v: string) => v.trim());
          attributes.push({
            name: attrName,
            options,
            visible: true
          });
        }
      }
    });

    return {
      name: row.name,
      sku: row.sku,
      regular_price: row.regular_price,
      sale_price: row.sale_price,
      stock_status: row.stock_status,
      manage_stock: row.manage_stock === "true",
      stock_quantity: row.stock_quantity ? Number(row.stock_quantity) : undefined,
      status: row.status,
      description: formatHtml(row["Beschrijving"]),
      short_description: formatHtml(row["Korte beschrijving"]),
      attributes
    };
  };

  const downloadTemplate = () => {
    const headers = [
      "name",
      "sku",
      "regular_price",
      "sale_price",
      "stock_status",
      "manage_stock",
      "stock_quantity",
      "status",
      "Beschrijving",
      "Korte beschrijving",
      "Attribuut 1 naam",
      "Attribuut 1 waarde(n)"
    ];
    const csv = Papa.unparse([headers]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "voorbeeld-producten.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">📦 CSV Product Import</Typography>

      <Button onClick={downloadTemplate}>📄 Download voorbeeld CSV</Button>

      <Button variant="outlined" component="label">
        Selecteer CSV bestand
        <input type="file" hidden accept=".csv" onChange={handleFileChange} />
      </Button>

      {rows.length > 0 && (
        <Box>
          <Typography variant="subtitle1">🔍 Preview eerste 10 rijen:</Typography>
          {rows.map((row, idx) => (
            <TextField
              key={idx}
              fullWidth
              multiline
              value={JSON.stringify(row, null, 2)}
              InputProps={{ readOnly: true }}
              margin="dense"
            />
          ))}
        </Box>
      )}

      {importing && <LinearProgress variant="determinate" value={progress} />}

      {errors.map((e, i) =>
        e ? (
          <Alert key={i} severity={e.startsWith("✅") ? "success" : "error"}>
            {e}
          </Alert>
        ) : null
      )}

      <Button
        variant="contained"
        onClick={handleImport}
        disabled={!file || importing}
      >
        🚀 Importeren
      </Button>
    </Box>
  );
}
