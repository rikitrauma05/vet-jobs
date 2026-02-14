import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await requireAdmin();

  const { dataFrom, dataTo } = await req.json();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("lavori")
    .select(`
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
  const stream = new PassThrough();

  doc.pipe(stream);

  const totale = (data ?? []).reduce(
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
  doc.fontSize(14).text(`Totale: € ${totale.toFixed(2)}`);

  doc.end();

  const chunks: Buffer[] = [];

  return new Promise<NextResponse>((resolve) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);

      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition":
              "attachment; filename=report-prestazioni.pdf",
          },
        })
      );
    });
  });
}
