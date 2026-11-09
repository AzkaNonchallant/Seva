import { NextResponse } from "next/server";

import { getReimbursement } from "@/lib/api/reimbursement";
import { buildReimbursementPdf } from "@/lib/pdf/reimbursement-pdf";
import { requireRole } from "@/lib/auth";

/**
 * Serves generated reimbursement PDFs inline from Documents.
 *
 * The backend stores document metadata but does not publish a download route.
 * Generated reports are deterministic, so the same real reimbursement data is
 * rendered again as the PDF response after the employee's ownership check.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  await requireRole(["EMPLOYEE"]);
  const { name } = await params;
  const match = decodeURIComponent(name).match(/^reimbursement-(\d+)\.pdf$/i);

  if (!match) {
    return NextResponse.json({ message: "PDF reimbursement tidak ditemukan." }, { status: 404 });
  }

  try {
    const reimbursement = await getReimbursement(Number(match[1]));
    const pdf = buildReimbursementPdf(reimbursement);
    const pdfBytes = pdf.buffer.slice(
      pdf.byteOffset,
      pdf.byteOffset + pdf.byteLength,
    ) as ArrayBuffer;

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="reimbursement-${reimbursement.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "PDF reimbursement tidak dapat dibuka." }, { status: 404 });
  }
}
