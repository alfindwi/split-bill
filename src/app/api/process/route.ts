import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return new Response("No file uploaded", { status: 400 });

    // ubah file ke base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:${file.type};base64,${base64Image}`;

    // setup LLM
    const llm = new ChatOpenAI({
      modelName: "openai/gpt-4o-mini",
      temperature: 0,
      maxTokens: 500,
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Product Extractor",
        },
      },
    });

    // prompt ekstraksi struk
    const result = await llm.invoke([
      new SystemMessage(
        "Kamu adalah AI yang mengekstrak item belanja dari gambar struk. Jawab hanya dengan JSON valid."
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `Ekstrak daftar item dari struk ini.

Aturan:
1. Jawab HANYA dengan JSON object yang valid (tanpa teks lain).
2. Format harus seperti ini:
{
  "items": [
    { "name": "string", "price": number, "quantity": number }
  ],
  "subtotal": number,
  "pajak": number,
  "total": number
}
3. Jika di struk tertulis "x 2" atau (2 nama product) → itu quantity.
4. Jika di struk harga sudah total (contoh: 20000 untuk 2 item) → hitung harga SATUAN = total dibagi quantity.
5. Semua harga dalam format rupiah penuh (contoh: 15000, bukan 15).
6. "subtotal" = jumlah semua (price × quantity) sebelum pajak.
7. "pajak" = nilai pajak (PPN, PB1, VAT) yang tercantum, jika tidak ada tulis 0.
8. "total" = subtotal + pajak.
9. Abaikan informasi lain seperti “Tunai”, “Kembalian”, atau nomor struk.
10. Pastikan output JSON valid tanpa ada komentar
`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      }),
    ]);

    // ambil teks dari hasil LLM
    const raw =
      Array.isArray(result.content) && result.content[0]?.type === "text"
        ? result.content[0].text
        : (result.content as string);

    let parsed: any = {};
    try {
      let cleaned = raw.trim();
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/i, "");

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Gagal parse JSON:", raw);
    }

    console.log({ parsed, raw });

    return NextResponse.json({
      items: parsed.items || [],
      subtotal: parsed.subtotal || 0,
      pajak: parsed.pajak || 0,
      total: parsed.total || 0,
      raw,
    });
  } catch (err) {
    console.error(err);
    return new Response("Error processing image", { status: 500 });
  }
}
