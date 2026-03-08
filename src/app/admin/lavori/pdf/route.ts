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
  let clienteFiltro: string | null = null;
  let prestazioneFiltro: string | null = null;
  let mostraFiltri = false;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();

    dataFrom = body.dataFrom ?? null;
    dataTo = body.dataTo ?? null;
    clienteFiltro = body.cliente ?? null;
    prestazioneFiltro = body.prestazione ?? null;
    mostraFiltri = body.mostraFiltri === true;
  } else {
    const form = await req.formData();

    dataFrom = (form.get("dataFrom") as string) ?? null;
    dataTo = (form.get("dataTo") as string) ?? null;
    clienteFiltro = (form.get("cliente") as string) ?? null;
    prestazioneFiltro = (form.get("prestazione") as string) ?? null;
    mostraFiltri = form.get("mostraFiltri") === "true";
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
    `)
    .order("data_prestazione", { ascending: true });

  if (dataFrom) query = query.gte("data_prestazione", dataFrom);
  if (dataTo) query = query.lte("data_prestazione", dataTo);

  const { data } = await query;

  let lavori = data ?? [];

  if (clienteFiltro) {
    lavori = lavori.filter((l: any) => {
      const cliente = Array.isArray(l.clienti)
        ? l.clienti[0]?.nome
        : l.clienti?.nome;

      return cliente?.toLowerCase().includes(clienteFiltro!.toLowerCase());
    });
  }

  if (prestazioneFiltro) {
    lavori = lavori.filter((l: any) => {
      const prestazione = Array.isArray(l.prestazioni)
        ? l.prestazioni[0]?.nome
        : l.prestazioni?.nome;

      return prestazione
        ?.toLowerCase()
        .includes(prestazioneFiltro!.toLowerCase());
    });
  }

  const doc = new PDFDocument({
    margin: 40,
    font: path.join(process.cwd(), "public/fonts/static/Roboto-Regular.ttf"),
  });

  const buffers: Buffer[] = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  /* ------------------ TITOLO ------------------ */

  doc.fontSize(20).text("Report Prestazioni", { align: "center" });
  doc.moveDown();

  /* ------------------ FILTRI (SE ATTIVI) ------------------ */

  if (mostraFiltri) {
    doc.fontSize(10);

    if (dataFrom || dataTo) {
      doc.text(`Periodo: ${dataFrom || "inizio"} - ${dataTo || "oggi"}`, {
        align: "center",
      });
    }

    if (clienteFiltro) {
      doc.text(`Cliente: ${clienteFiltro}`, { align: "center" });
    }

    if (prestazioneFiltro) {
      doc.text(`Prestazione: ${prestazioneFiltro}`, { align: "center" });
    }

    doc.moveDown();
  }

  /* ------------------ RAGGRUPPAMENTO CLIENTI ------------------ */

  const clientiMap: Record<string, any[]> = {};

  lavori.forEach((l: any) => {
    const cliente = Array.isArray(l.clienti)
      ? l.clienti[0]?.nome
      : l.clienti?.nome;

    const nomeCliente = cliente || "Cliente sconosciuto";

    if (!clientiMap[nomeCliente]) clientiMap[nomeCliente] = [];
    clientiMap[nomeCliente].push(l);
  });

  let totaleGenerale = 0;

  Object.entries(clientiMap).forEach(([cliente, lista]) => {
    doc.moveDown();
    doc.fontSize(14).text(cliente);
    doc.moveDown(0.5);

    let totaleCliente = 0;

    lista.forEach((l: any) => {
      const dataEffettiva = l.data_prestazione ?? l.created_at;

      const prestazione = Array.isArray(l.prestazioni)
        ? l.prestazioni[0]?.nome
        : l.prestazioni?.nome;

      const prezzo = l.prezzo ?? 0;

      totaleCliente += prezzo;
      totaleGenerale += prezzo;

      doc
        .fontSize(11)
        .text(
          `${new Date(dataEffettiva).toLocaleDateString()}   ${prestazione}   € ${prezzo.toFixed(
            2
          )}`
        );
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text(`Totale cliente: € ${totaleCliente.toFixed(2)}`, {
      align: "right",
    });

    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  });

  /* ------------------ TOTALE GENERALE ------------------ */

  doc.moveDown();

  doc.fontSize(16).text(`Totale generale: € ${totaleGenerale.toFixed(2)}`, {
    align: "right",
  });

  doc.end();

  const pdfBuffer: Buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

  let fileName = "report-lavori";

if (clienteFiltro) {
  fileName += "-" + clienteFiltro.toLowerCase().replace(/\s+/g, "-");
}

if (dataFrom && dataTo) {
  fileName += `-${dataFrom}_${dataTo}`;
} else if (dataFrom) {
  fileName += `-da-${dataFrom}`;
} else if (dataTo) {
  fileName += `-fino-${dataTo}`;
}

fileName += ".pdf";

return new NextResponse(new Uint8Array(pdfBuffer), {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileName}"`,
  },
});
}