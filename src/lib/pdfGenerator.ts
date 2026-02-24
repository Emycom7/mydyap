import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(
  slidesContainerId: string,
  title: string
): Promise<Blob> {
  const container = document.getElementById(slidesContainerId);
  if (!container) throw new Error("Container introuvable");

  const slides = container.querySelectorAll("[data-slide]");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = 297;
  const pageHeight = 210;

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage();
    
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2,
      backgroundColor: "#0d1321",
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const yOffset = Math.max(10, (pageHeight - imgHeight) / 2);

    // Dark background
    pdf.setFillColor(13, 19, 33);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    
    pdf.addImage(imgData, "PNG", 10, yOffset, imgWidth, Math.min(imgHeight, pageHeight - 20));

    // Page number
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 170);
    pdf.text(`${i + 1} / ${slides.length}`, pageWidth - 15, pageHeight - 5);
  }

  return pdf.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
