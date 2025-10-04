import { IProcess } from "@/lib/types/process";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return new Response("No file uploaded", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Ekstrak daftar item dari struk belanja ini.

Aturan umum:
1. Jawab HANYA dengan JSON object yang valid (tanpa teks lain).
2. Format:
{
  "items": [
    { "name": "string", "price": number, "quantity": number }
  ],
  "subtotal": number,
  "pajak": number,
  "total": number
}
3. Quantity = angka paling kiri baris.
4. Angka paling kanan bisa berarti HARGA SATUAN atau TOTAL harga. Tentukan secara otomatis:
   - Jika (angka kanan × quantity) = subtotal baris, maka angka kanan adalah harga satuan.
   - Jika (angka kanan) sudah cocok dengan total baris, maka angka kanan adalah total harga (harga per item = angka kanan ÷ quantity).
5. Pastikan "price" selalu disimpan sebagai HARGA SATUAN (bukan total).
6. TOTAL harga untuk item = price × quantity.
7. Semua harga ditulis dalam rupiah penuh (contoh: 20000, bukan 20.000 atau 20).
8. "subtotal" = jumlah semua total item sebelum pajak.
9. "pajak" = nilai pajak (PB1, PPN, VAT, service charge), jika ada. Jika tidak ada tulis 0.
10. "total" = subtotal + pajak.
11. Abaikan informasi lain seperti tunai, voucher, kembalian, dsb.
12. Output harus JSON valid tanpa komentar, tanpa teks tambahan.

`;

    const result = await model.generateContent([
      { inlineData: { mimeType: file.type, data: base64Image } },
      { text: prompt },
    ]);

    const raw = result.response.text().trim();

    let parsed: IProcess = { items: [], subtotal: 0, pajak: 0, total: 0 };

    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "");

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Gagal parse JSON:", raw, err);
    }

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
