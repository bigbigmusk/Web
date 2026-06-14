"use client";

import type { Lead, Report } from "@/lib/types";

// ── CSV export ──────────────────────────────────────────────────
function escapeCSV(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCSV(r[h])).join(",")),
  ].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportLeadsCSV(leads: Lead[]) {
  downloadCSV(
    leads.map((l) => ({
      Company: l.company_name,
      Country: l.country,
      Website: l.website,
      "Customer Type": l.customer_type,
      Contact: l.contact_name,
      Email: l.email,
      LinkedIn: l.linkedin_url,
      Source: l.source,
      Priority: l.priority,
      Status: l.status,
      "Fit Score": l.fit_score ?? "",
      "Last Contacted": l.last_contacted_at ?? "",
      Notes: l.notes,
    })),
    "stratix-leads.csv"
  );
}

// ── PDF export (client-side via jsPDF) ──────────────────────────
export async function exportReportPDF(report: Report, watermark = false) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 56;
  let y = margin;

  // Cover
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, W, 150, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("STRATIX  ·  Strategic Intelligence", margin, 60);
  doc.setFontSize(22);
  doc.text(doc.splitTextToSize(report.title, W - margin * 2), margin, 95);
  doc.setFontSize(10);
  doc.setTextColor(180, 190, 200);
  doc.text(report.report_type, margin, 125);

  y = 190;
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(report.summary, W - margin * 2);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 15 + 14;

  for (const section of report.sections) {
    if (y > H - 120) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(14, 165, 183);
    doc.text(section.heading, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(section.body, W - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 6;
    for (const b of section.bullets ?? []) {
      if (y > H - 80) {
        doc.addPage();
        y = margin;
      }
      const bl = doc.splitTextToSize(`•  ${b}`, W - margin * 2 - 12);
      doc.text(bl, margin + 12, y);
      y += bl.length * 14;
    }
    y += 10;
  }

  if (watermark) {
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(48);
      doc.text("STRATIX FREE", W / 2, H / 2, { align: "center", angle: 30 });
    }
  }

  doc.save(`${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
