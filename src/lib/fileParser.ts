import * as XLSX from "xlsx";

export function parseFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
          resolve(csv);
        } catch (err) {
          reject(new Error("Erreur de parsing Excel"));
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsArrayBuffer(file);
    }
  });
}
