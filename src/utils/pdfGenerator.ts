import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  elementId: string;
  filename: string;
  onProgress?: (status: string) => void;
}

export async function exportReportToPDF(options: PDFExportOptions): Promise<void> {
  const { elementId, filename, onProgress } = options;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('المان گزارش جهت ایجاد فایل PDF یافت نشد.');
  }

  if (onProgress) onProgress('در حال آماده‌سازی و رندر گرافیکی برگه آزمایش...');

  // Ensure scroll is at top
  window.scrollTo(0, 0);

  try {
    // Capture element using html2canvas with 2x scale for crisp 300dpi printing
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      ignoreElements: (element: Element) => {
        return element.classList.contains('no-print');
      },
    });

    if (onProgress) onProgress('در حال تولید سند PDF با ابعاد استاندارد A4...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A4 dimensions in mm: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 8; // 8mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    if (contentHeight <= pdfHeight - (margin * 2)) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page handling if content exceeds one A4 page
      let heightLeft = contentHeight;
      let position = margin;
      const pageAvailableHeight = pdfHeight - (margin * 2);

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= pageAvailableHeight;

      while (heightLeft > 0) {
        position = -(contentHeight - heightLeft) + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= pageAvailableHeight;
      }
    }

    if (onProgress) onProgress('در حال دانلود فایل PDF...');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error('html2canvas rendering error:', error);
    // If client-side canvas generation fails, trigger native browser PDF print as seamless fallback
    if (onProgress) onProgress('انتقال به پنجره ذخیره PDF مرورگر...');
    window.print();
  }
}
