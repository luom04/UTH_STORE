//src/utils/excel.js
import ExcelJS from "exceljs";

export async function buildWorkbook({
  sheetName = "Data",
  columns = [],
  rows = [],
}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width || 20,
  }));
  rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  return wb;
}
