import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';

declare global {
  interface Window {
    XLSX?: any;
    jspdf?: { jsPDF?: any };
    autoTable?: any;
    docx?: any;
  }
}

interface Holiday {
  name: string;
  nameAr: string;
  date: string;
  type: 'religious' | 'national' | 'cultural';
  duration?: number;
}

interface CalendarDownloadButtonsProps {
  countryName: string;
  countryNameAr: string;
  countryCode: string;
  year: number;
  holidays: Holiday[];
  language: string;
}

const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function getHolidayDatesSet(holidays: Holiday[]): Set<string> {
  const dates = new Set<string>();
  holidays.forEach(h => {
    const start = new Date(h.date);
    const dur = h.duration || 1;
    for (let i = 0; i < dur; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.add(d.toISOString().split('T')[0]);
    }
  });
  return dates;
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

// Cache for loaded Arabic font
let arabicFontCache: string | null = null;

let xlsxLoader: Promise<any> | null = null;
const scriptLoaders: Record<string, Promise<void>> = {};

function loadScript(src: string, isReady: () => boolean, label: string): Promise<void> {
  if (isReady()) return Promise.resolve();
  if (!scriptLoaders[src]) {
    scriptLoaders[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => isReady() ? resolve() : reject(new Error(`${label} failed to load`));
      script.onerror = () => reject(new Error(`${label} script failed to load`));
      document.head.appendChild(script);
    });
  }
  return scriptLoaders[src];
}

function loadXLSX(): Promise<any> {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (xlsxLoader) return xlsxLoader;

  xlsxLoader = loadScript('/vendor/xlsx.full.min.js', () => Boolean(window.XLSX), 'XLSX')
    .then(() => window.XLSX);

  return xlsxLoader;
}

async function loadPDFLibraries() {
  await loadScript('/vendor/jspdf.umd.min.js', () => Boolean(window.jspdf?.jsPDF), 'jsPDF');
  await loadScript('/vendor/jspdf.plugin.autotable.min.js', () => typeof window.autoTable === 'function', 'jsPDF AutoTable');

  return {
    jsPDF: window.jspdf!.jsPDF!,
    autoTable: window.autoTable,
  };
}

async function loadDocx() {
  await loadScript('/vendor/docx.umd.cjs', () => Boolean(window.docx?.Document), 'DOCX');
  return window.docx!;
}

async function loadArabicFont(): Promise<string> {
  if (arabicFontCache) return arabicFontCache;
  const response = await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf');
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  arabicFontCache = btoa(binary);
  return arabicFontCache;
}

async function generateExcel(props: CalendarDownloadButtonsProps) {
  const { countryName, countryNameAr, countryCode, year, holidays, language } = props;
  const XLSX = await loadXLSX();
  const isAr = language === 'ar';
  const name = isAr ? countryNameAr : countryName;
  const dayNames = isAr ? DAY_NAMES_AR : DAY_NAMES_EN;
  const monthNames = isAr ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const holidayDates = getHolidayDatesSet(holidays);

  const wb = XLSX.utils.book_new();

  // Page 1: Calendar
  const calRows: any[][] = [];
  calRows.push([isAr ? `تقويم العطل الرسمية - ${name} ${year}` : `Public Holidays Calendar - ${name} ${year}`]);
  calRows.push([]);

  for (let m = 0; m < 12; m++) {
    calRows.push([monthNames[m]]);
    calRows.push(dayNames);
    const grid = getMonthGrid(year, m);
    grid.forEach(week => {
      calRows.push(week.map((d) => {
        if (d === null) return '';
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return holidayDates.has(dateStr) ? `★${d}` : d;
      }));
    });
    calRows.push([]);
  }
  calRows.push([isAr ? '★ = عطلة رسمية' : '★ = Public Holiday']);

  const ws1 = XLSX.utils.aoa_to_sheet(calRows);
  // Set RTL for Arabic sheets
  if (isAr) {
    if (!ws1['!sheetViews']) ws1['!sheetViews'] = [{}];
    (ws1 as any)['!sheetViews'] = [{ rightToLeft: true }];
  }
  XLSX.utils.book_append_sheet(wb, ws1, isAr ? 'التقويم' : 'Calendar');

  // Page 2: Holiday list
  const listRows: any[][] = [];
  listRows.push([isAr ? `العطل الرسمية - ${name} ${year}` : `Public Holidays - ${name} ${year}`]);
  listRows.push([]);
  listRows.push(isAr ? ['التاريخ', 'العطلة', 'النوع', 'المدة'] : ['Date', 'Holiday', 'Type', 'Duration']);
  holidays.forEach(h => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const typeLabel = isAr
      ? (h.type === 'religious' ? 'ديني' : h.type === 'national' ? 'وطني' : 'ثقافي')
      : (h.type === 'religious' ? 'Religious' : h.type === 'national' ? 'National' : 'Cultural');
    const dur = isAr
      ? `${h.duration || 1} ${(h.duration || 1) === 1 ? 'يوم' : 'أيام'}`
      : `${h.duration || 1} ${(h.duration || 1) === 1 ? 'day' : 'days'}`;
    listRows.push([dateStr, isAr ? h.nameAr : h.name, typeLabel, dur]);
  });
  listRows.push([]);
  listRows.push(['https://egazat.com']);

  const ws2 = XLSX.utils.aoa_to_sheet(listRows);
  if (isAr) {
    (ws2 as any)['!sheetViews'] = [{ rightToLeft: true }];
  }
  XLSX.utils.book_append_sheet(wb, ws2, isAr ? 'العطل' : 'Holidays');

  // Set workbook properties for UTF-8
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.WBProps = wb.Workbook.WBProps || {};

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: true });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${countryCode}-holidays-${year}-${language}.xlsx`);
}

async function generatePDF(props: CalendarDownloadButtonsProps) {
  const { jsPDF, autoTable } = await loadPDFLibraries();
  const { countryName, countryNameAr, countryCode, year, holidays, language } = props;
  const isAr = language === 'ar';
  const name = isAr ? countryNameAr : countryName;
  const dayNames = isAr ? DAY_NAMES_AR : DAY_NAMES_EN;
  const monthNames = isAr ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const holidayDates = getHolidayDatesSet(holidays);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Load and add Arabic font for proper encoding
  if (isAr) {
    const fontBase64 = await loadArabicFont();
    doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
  }

  // Page 1: Calendar tables
  const title = isAr ? `تقويم العطل الرسمية - ${name} ${year}` : `Public Holidays Calendar - ${name} ${year}`;
  doc.setFontSize(14);
  doc.text(title, 105, 12, { align: 'center' });

  let yPos = 18;
  const colWidth = 90;
  const gap = 10;

  for (let m = 0; m < 12; m++) {
    const col = m % 2;
    const row = Math.floor(m / 2);
    if (m > 0 && m % 2 === 0) {
      yPos = 18 + row * 44;
    }

    if (yPos > 260) {
      doc.addPage();
      yPos = 12;
    }

    const xStart = 10 + col * (colWidth + gap);
    const grid = getMonthGrid(year, m);

    const tableData = grid.map(week =>
      week.map((d) => {
        if (d === null) return '';
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return holidayDates.has(dateStr) ? `★${d}` : String(d);
      })
    );

    const fontForTable = isAr ? 'Amiri' : 'helvetica';

    autoTable(doc, {
      startY: yPos,
      margin: { left: xStart },
      tableWidth: colWidth,
      head: [[monthNames[m], '', '', '', '', '', ''], dayNames],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1, halign: 'center', minCellHeight: 5, font: fontForTable },
      headStyles: { fillColor: [41, 128, 185], fontSize: 7, halign: 'center', font: fontForTable },
      didParseCell: (data: any) => {
        if (data.section === 'body' && typeof data.cell.raw === 'string' && data.cell.raw.startsWith('★')) {
          data.cell.styles.fillColor = [255, 235, 235];
          data.cell.styles.textColor = [200, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    const tableEndY = (doc as any).lastAutoTable?.finalY ?? yPos + 40;
    if (col === 1) {
      yPos = tableEndY + 4;
    }
  }

  doc.setFontSize(8);
  if (isAr) doc.setFont('Amiri');
  doc.text(isAr ? '★ = عطلة رسمية' : '★ = Public Holiday', 105, 290, { align: 'center' });

  // Page 2: Holiday list
  doc.addPage();
  doc.setFontSize(14);
  if (isAr) doc.setFont('Amiri');
  const listTitle = isAr ? `العطل الرسمية - ${name} ${year}` : `Public Holidays - ${name} ${year}`;
  doc.text(listTitle, 105, 15, { align: 'center' });

  const headers = isAr ? ['#', 'التاريخ', 'العطلة', 'النوع', 'المدة'] : ['#', 'Date', 'Holiday', 'Type', 'Duration'];
  const rows = holidays.map((h, i) => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const typeLabel = isAr
      ? (h.type === 'religious' ? 'ديني' : h.type === 'national' ? 'وطني' : 'ثقافي')
      : (h.type === 'religious' ? 'Religious' : h.type === 'national' ? 'National' : 'Cultural');
    const dur = `${h.duration || 1} ${isAr ? ((h.duration || 1) === 1 ? 'يوم' : 'أيام') : ((h.duration || 1) === 1 ? 'day' : 'days')}`;
    return [String(i + 1), dateStr, isAr ? h.nameAr : h.name, typeLabel, dur];
  });

  const fontForList = isAr ? 'Amiri' : 'helvetica';

  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3, font: fontForList },
    headStyles: { fillColor: [41, 128, 185], font: fontForList },
  });

  const finalY = ((doc as any).lastAutoTable?.finalY ?? 200) + 15;
  doc.setFontSize(10);
  doc.setTextColor(41, 128, 185);
  doc.textWithLink('https://egazat.com', 105, finalY, { align: 'center', url: 'https://egazat.com' });

  doc.save(`${countryCode}-holidays-${year}-${language}.pdf`);
}

async function generateWord(props: CalendarDownloadButtonsProps) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ExternalHyperlink, AlignmentType, WidthType, BorderStyle, ShadingType } = await loadDocx();
  const { countryName, countryNameAr, countryCode, year, holidays, language } = props;
  const isAr = language === 'ar';
  const name = isAr ? countryNameAr : countryName;
  const dayNames = isAr ? DAY_NAMES_AR : DAY_NAMES_EN;
  const monthNames = isAr ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const holidayDates = getHolidayDatesSet(holidays);

  // Use Arial for Arabic (widely supported), fallback for English
  const fontName = isAr ? 'Arial' : 'Arial';
  const textDirection = isAr ? 'rtl' : 'ltr';

  const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  // Build calendar tables for all 12 months
  const calendarChildren: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      bidirectional: isAr,
      children: [new TextRun({ text: isAr ? `تقويم العطل الرسمية - ${name} ${year}` : `Public Holidays Calendar - ${name} ${year}`, bold: true, size: 28, font: fontName, rightToLeft: isAr })],
    }),
  ];

  for (let m = 0; m < 12; m++) {
    calendarChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        bidirectional: isAr,
        children: [new TextRun({ text: monthNames[m], bold: true, size: 22, font: fontName, rightToLeft: isAr })],
      })
    );

    const grid = getMonthGrid(year, m);
    const headerRow = new TableRow({
      children: dayNames.map(d =>
        new TableCell({
          borders: cellBorders,
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: '2980B9', type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: isAr, children: [new TextRun({ text: d, bold: true, size: 16, font: fontName, color: 'FFFFFF', rightToLeft: isAr })] })],
        })
      ),
    });

    const bodyRows = grid.map(week =>
      new TableRow({
        children: week.map((d) => {
          const dateStr = d ? `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';
          const isHoliday = d ? holidayDates.has(dateStr) : false;
          return new TableCell({
            borders: cellBorders,
            width: { size: 1300, type: WidthType.DXA },
            shading: isHoliday ? { fill: 'FFEBEB', type: ShadingType.CLEAR } : undefined,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: d ? [new TextRun({ text: String(d), size: 16, font: fontName, bold: isHoliday, color: isHoliday ? 'CC0000' : '000000' })] : [],
            })],
          });
        }),
      })
    );

    calendarChildren.push(
      new Table({
        width: { size: 9100, type: WidthType.DXA },
        columnWidths: [1300, 1300, 1300, 1300, 1300, 1300, 1300],
        rows: [headerRow, ...bodyRows],
      })
    );
  }

  calendarChildren.push(
    new Paragraph({
      spacing: { before: 200 },
      bidirectional: isAr,
      children: [new TextRun({ text: isAr ? '★ الأيام المظللة بالأحمر = عطلة رسمية' : 'Red-highlighted days = Public Holiday', size: 18, font: fontName, italics: true, rightToLeft: isAr })],
    })
  );

  // Page 2: Holiday list
  const listChildren: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      bidirectional: isAr,
      children: [new TextRun({ text: isAr ? `العطل الرسمية - ${name} ${year}` : `Public Holidays - ${name} ${year}`, bold: true, size: 28, font: fontName, rightToLeft: isAr })],
    }),
  ];

  const listHeader = new TableRow({
    children: (isAr ? ['#', 'التاريخ', 'العطلة', 'النوع', 'المدة'] : ['#', 'Date', 'Holiday', 'Type', 'Duration']).map(h =>
      new TableCell({
        borders: cellBorders,
        shading: { fill: '2980B9', type: ShadingType.CLEAR },
        children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text: h, bold: true, size: 20, font: fontName, color: 'FFFFFF', rightToLeft: isAr })] })],
      })
    ),
  });

  const listRows = holidays.map((h, i) => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const typeLabel = isAr
      ? (h.type === 'religious' ? 'ديني' : h.type === 'national' ? 'وطني' : 'ثقافي')
      : (h.type === 'religious' ? 'Religious' : h.type === 'national' ? 'National' : 'Cultural');
    const dur = `${h.duration || 1} ${isAr ? ((h.duration || 1) === 1 ? 'يوم' : 'أيام') : ((h.duration || 1) === 1 ? 'day' : 'days')}`;

    return new TableRow({
      children: [String(i + 1), dateStr, isAr ? h.nameAr : h.name, typeLabel, dur].map(text =>
        new TableCell({
          borders: cellBorders,
          children: [new Paragraph({ bidirectional: isAr, children: [new TextRun({ text, size: 20, font: fontName, rightToLeft: isAr })] })],
        })
      ),
    });
  });

  listChildren.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [600, 2500, 3000, 1500, 1760],
      rows: [listHeader, ...listRows],
    })
  );

  listChildren.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new ExternalHyperlink({
          children: [new TextRun({ text: 'https://egazat.com', style: 'Hyperlink', size: 22, font: fontName })],
          link: 'https://egazat.com',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: isAr ? { bidi: true } as any : undefined,
        children: calendarChildren,
      },
      {
        properties: isAr ? { bidi: true } as any : undefined,
        children: listChildren,
      },
    ],
  });

  const buf = await Packer.toBlob(doc);
  downloadBlob(buf, `${countryCode}-holidays-${year}-${language}.docx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const CalendarDownloadButtons = (props: CalendarDownloadButtonsProps) => {
  const isAr = props.language === 'ar';

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <Button
        className="gap-2 bg-[#217346] hover:bg-[#1a5c38] text-white border-0"
        onClick={() => generateExcel(props)}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isAr ? 'تحميل Excel' : 'Download Excel'}
      </Button>
      <Button
        className="gap-2 bg-[#DC3545] hover:bg-[#b52d3a] text-white border-0"
        onClick={() => generatePDF(props)}
      >
        <FileText className="h-4 w-4" />
        {isAr ? 'تحميل PDF' : 'Download PDF'}
      </Button>
      <Button
        className="gap-2 bg-[#2B579A] hover:bg-[#1e3f6f] text-white border-0"
        onClick={() => generateWord(props)}
      >
        <FileDown className="h-4 w-4" />
        {isAr ? 'تحميل Word' : 'Download Word'}
      </Button>
    </div>
  );
};
