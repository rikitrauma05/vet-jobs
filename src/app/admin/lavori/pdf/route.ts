import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await requireAdmin();

  let dataFrom: string | null = null;
  let dataTo: string | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    dataFrom = body.dataFrom ?? null;
    dataTo = body.dataTo ?? null;
  } else {
    const form = await req.formData();
    dataFrom = (form.get("dataFrom") as string) ?? null;
    dataTo = (form.get("dataTo") as string) ?? null;
  }

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

 const doc = new PDFDocument({
  margin: 40,
  font: path.join(process.cwd(), "public/fonts/static/Roboto-Regular.ttf"),
});

  const buffers: Buffer[] = [];

  doc.on("data", (chunk) => buffers.push(chunk));

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "static",
    "Roboto-Regular.ttf"
  );


  const totale = (data ?? []).reduce(
    (acc: number, l: any) => acc + (l.prezzo ?? 0),
    0
  );

  doc.fontSize(20).text("Report Prestazioni", { align: "center" });
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
      `${new Date(dataEffettiva).toLocaleDateString()} | ${cliente} | ${prestazione} | € ${l.prezzo ?? 0}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Totale: € ${totale.toFixed(2)}`);

  doc.end();

  const pdfBuffer: Buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

 return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=report-prestazioni.pdf",
    },
  });
}