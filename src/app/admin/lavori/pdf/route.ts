import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  await requireAdmin();

  const { dataFrom, dataTo } = await req.json();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("lavori")
    .select(`
      id,
      prezzo,
      data_prestazione,
      created_at,
      clienti:clienti(nome),
      prestazioni:prestazioni(nome)
    `);

  if (dataFrom) query = query.gte("data_prestazione", dataFrom);
  if (dataTo) query = query.lte("data_prestazione", dataTo);

  const { data } = await query;

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  const total = (data ?? []).reduce(
    (acc: number, l: any) => acc + (l.prezzo ?? 0),
    0
  );

  doc.fontSize(18).text("Report Prestazioni", { align: "center" });
  doc.moveDown();
  doc.fontSize(12);

  data?.forEach((l: any) => {
    const dataEffettiva = l.data_prestazione ?? l.created_at;

    const cliente = Array.isArray(l.clienti)
      ? l.clienti[0]?.nome
      : l.clienti?.nome;

    const prestazione = Array.isArray(l.prestazioni)
      ? l.prestazioni[0]?.nome
      : l.prestazioni?.nome;

    doc.text(
      `${new Date(dataEffettiva).toLocaleDateString()} - ${cliente} - ${prestazione} - € ${l.prezzo ?? 0}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Totale: € ${total.toFixed(2)}`, {
    align: "right",
  });

    doc.end();

  const pdfBuffer: Buffer = await new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  const pdfUint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(pdfUint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=report-prestazioni.pdf",
    },
  });

}
