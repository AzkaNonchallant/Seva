import type { Reimbursement } from "@/lib/api/types";

import { formatDate, formatIDR } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  TRANSPORT: "Transportasi",
  MEAL: "Konsumsi",
  ALLOWANCE: "Uang Saku",
  OTHER: "Lainnya",
};

/** Builds a small, valid PDF without inventing a document or using dummy data. */
export function buildReimbursementPdf(reimbursement: Reimbursement): Uint8Array {
  const travel = reimbursement.travel;
  const pages: string[][] = [];
  let commands: string[] = [];
  let cursor = 680;

  const startPage = (first = false) => {
    commands = [];
    pages.push(commands);
    cursor = first ? 680 : 770;
    if (!first) {
      rect(commands, 0, 780, 595, 62, COLORS.primary);
      text(commands, "HORIZON ODYSSEY", 42, 816, 13, "F2", COLORS.white);
      text(commands, `Reimbursement #${reimbursement.id}`, 42, 797, 9, "F1", COLORS.light);
    }
  };

  const ensure = (height: number) => {
    if (cursor - height < 55) startPage();
  };

  const section = (title: string) => {
    ensure(34);
    text(commands, title, 42, cursor, 11, "F2", COLORS.primary);
    line(commands, 42, cursor - 8, 553, cursor - 8, COLORS.lilac);
    cursor -= 28;
  };

  const field = (label: string, value: string, x: number, width: number) => {
    text(commands, label.toUpperCase(), x, cursor, 7.5, "F2", COLORS.muted);
    const wrapped = wrap(value, Math.floor(width / 5.4));
    wrapped.forEach((part, index) => text(commands, part, x, cursor - 14 - index * 13, 10, "F1", COLORS.ink));
  };

  startPage(true);
  rect(commands, 0, 710, 595, 132, COLORS.primary);
  text(commands, "HORIZON ODYSSEY", 42, 798, 10, "F2", COLORS.lilac);
  text(commands, "RINGKASAN REIMBURSEMENT", 42, 765, 21, "F2", COLORS.white);
  text(commands, "Dokumen pertanggungjawaban perjalanan dinas", 42, 741, 10, "F1", COLORS.light);
  text(commands, `#${reimbursement.id}`, 505, 765, 12, "F2", COLORS.white);

  section("IDENTITAS KARYAWAN");
  rect(commands, 42, cursor - 66, 511, 58, COLORS.surface);
  field("Nama karyawan", travel?.user?.name ?? "Tidak tersedia", 58, 220);
  field("Email", travel?.user?.email ?? "Tidak tersedia", 310, 220);
  cursor -= 88;

  section("INFORMASI PERJALANAN DINAS");
  rect(commands, 42, cursor - 92, 511, 84, COLORS.surface);
  field("Tujuan", travel?.destination ?? `Travel #${reimbursement.travelId}`, 58, 220);
  field("Periode", travel?.startDate && travel.endDate ? `${formatDate(travel.startDate)} sampai ${formatDate(travel.endDate)}` : "Tidak tersedia", 310, 220);
  cursor -= 44;
  field("Keperluan", travel?.purpose ?? "Tidak tersedia", 58, 460);
  field("Estimasi biaya", formatIDR(travel?.estimatedCost), 310, 220);
  cursor -= 70;

  section("DETAIL PEMBAYARAN");
  const tableTop = cursor;
  rect(commands, 42, tableTop - 24, 511, 24, COLORS.primary);
  text(commands, "KETERANGAN", 54, tableTop - 16, 8, "F2", COLORS.white);
  text(commands, "TANGGAL", 340, tableTop - 16, 8, "F2", COLORS.white);
  text(commands, "NOMINAL", 470, tableTop - 16, 8, "F2", COLORS.white);
  cursor -= 24;

  const items = reimbursement.items ?? [];
  if (!items.length) {
    rect(commands, 42, cursor - 26, 511, 26, COLORS.surface);
    text(commands, "Belum ada detail pengeluaran", 54, cursor - 16, 9, "F1", COLORS.muted);
    cursor -= 26;
  } else {
    items.forEach((item, index) => {
      const description = `${CATEGORY_LABEL[item.category] ?? item.category}: ${item.description}`;
      const rowHeight = wrap(description, 42).length > 1 ? 34 : 26;
      ensure(rowHeight + 4);
      if (index % 2 === 0) rect(commands, 42, cursor - rowHeight, 511, rowHeight, COLORS.surface);
      wrap(description, 42).forEach((part, lineIndex) => text(commands, part, 54, cursor - 15 - lineIndex * 11, 8.5, "F1", COLORS.ink));
      text(commands, formatDate(item.transactionDate), 340, cursor - 15, 8.5, "F1", COLORS.muted);
      text(commands, formatIDR(item.amount), 470, cursor - 15, 8.5, "F2", COLORS.ink);
      cursor -= rowHeight;
    });
  }

  cursor -= 16;
  ensure(110);
  rect(commands, 300, cursor - 102, 253, 102, COLORS.lilac);
  text(commands, "RINGKASAN NILAI", 316, cursor - 20, 9, "F2", COLORS.primary);
  summaryLine(commands, "Total pengajuan", formatIDR(reimbursement.totalAmount), cursor - 42);
  summaryLine(commands, "Uang muka", formatIDR(reimbursement.advanceAmount), cursor - 59);
  summaryLine(commands, "Disetujui Finance", formatIDR(reimbursement.approvedAmount), cursor - 76);
  summaryLine(commands, "Status", reimbursement.status, cursor - 93);
  cursor -= 125;

  if (reimbursement.externalJournalRef) {
    text(commands, `Referensi jurnal: ${reimbursement.externalJournalRef}`, 42, cursor, 8.5, "F1", COLORS.muted);
  }

  pages.forEach((page, index) => {
    text(page, `Horizon Odyssey • Reimbursement #${reimbursement.id} • Halaman ${index + 1}`, 42, 30, 7.5, "F1", COLORS.muted);
  });

  const pageObjects: string[] = [];
  const contentObjects: string[] = [];
  const firstPageId = 5;
  pages.forEach((page, index) => {
    const pageId = firstPageId + index * 2;
    const contentId = pageId + 1;
    pageObjects.push(`${pageId} 0 R`);
    contentObjects.push(`<< /Length ${page.join("\n").length} >>\nstream\n${page.join("\n")}\nendstream`);
  });

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageObjects.join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    ...pages.flatMap((_, index) => {
      const pageId = firstPageId + index * 2;
      const contentId = pageId + 1;
      return [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
        contentObjects[index],
      ];
    }),
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}

const COLORS = {
  primary: "0.082 0 0.173 rg",
  white: "1 1 1 rg",
  light: "0.88 0.82 0.99 rg",
  lilac: "0.88 0.89 1 rg",
  surface: "0.95 0.95 0.98 rg",
  ink: "0.024 0 0 rg",
  muted: "0.36 0.35 0.35 rg",
};

function text(
  commands: string[],
  value: string,
  x: number,
  y: number,
  size: number,
  font: "F1" | "F2",
  color: string,
) {
  commands.push(`${color}\nBT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);
}

function rect(commands: string[], x: number, y: number, width: number, height: number, color: string) {
  commands.push(`${color}\n${x} ${y} ${width} ${height} re f`);
}

function line(commands: string[], x1: number, y1: number, x2: number, y2: number, color: string) {
  commands.push(`${color}\n0.7 w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function summaryLine(commands: string[], label: string, value: string, y: number) {
  text(commands, label, 316, y, 8, "F1", COLORS.muted);
  text(commands, value, 455, y, 8, "F2", COLORS.ink);
}

function wrap(value: string, maxCharacters: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
