import type { PaymentData } from "../api/api.types";

const MIME_TYPES: Record<string, string> = {
  txt: "text/plain",
  csv: "text/csv",
};

export const downloadFile = (content: string, filename: string, ext: string) => {
  const mime = MIME_TYPES[ext] ?? "text/plain";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parsePaymentFileContent = (data: PaymentData[]) => {
  for (const file of data) {
    const rows: { Content: string }[] = JSON.parse(file.Content);
    let fileContent = "";
    for (let i = 0; i < rows.length; i++) {
      let text = rows[i].Content;
      if (text.length > 2 && text.slice(-2) === "**") {
        text = text.substring(0, text.length - 2);
      }
      const isLast = i === rows.length - 1;
      fileContent += isLast ? text : text + "\r\n";
    }
    downloadFile(fileContent, file.FileRef, file.FileType);
  }
};
