export const prompt = `Ekstrak semua item dari struk belanja ini dan kembalikan HANYA dalam format JSON yang valid.

ATURAN EKSTRAKSI:

1. FORMAT OUTPUT
   - Kembalikan HANYA JSON object tanpa teks penjelasan apapun
   - Tidak boleh ada markdown (\`\`\`json), komentar, atau teks tambahan
   - Struktur JSON harus PERSIS seperti ini:

{
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit_price": number,
      "total_price": number
    }
  ],
  "subtotal": number,
  "tax": number,
  "service_charge": number,
  "grand_total": number
}

2. EKSTRAKSI ITEM
   - "name": Nama item/produk (string, huruf kapital di awal kata)
   - "quantity": Jumlah item (number, default 1 jika tidak disebutkan)
   - "unit_price": Harga per satuan (number, dalam rupiah penuh)
   - "total_price": Harga total untuk item ini (quantity × unit_price)

3. MENENTUKAN QUANTITY
   - Jika tertulis "x2", "x 2", "(2)", atau "2x" → quantity = 2
   - Jika nama produk muncul 2 kali berturut-turut → quantity = 2, gabungkan jadi 1 item
   - Jika tidak ada tanda quantity → quantity = 1

4. MENGHITUNG HARGA SATUAN
   - Jika harga yang tertera adalah TOTAL untuk beberapa quantity:
     unit_price = total_price ÷ quantity
   - Contoh: "Aqua x2 = 10000" → unit_price: 5000, quantity: 2, total_price: 10000
   - Jika harga adalah per satuan, kalikan dengan quantity untuk total_price

5. BIAYA TAMBAHAN
   - "subtotal": SUM dari semua item total_price (sebelum tax/service/discount)
   - "tax": Nilai pajak (PPN/PB1/VAT/Tax) jika ada, jika tidak ada isi 0
   - "service_charge": Nilai service charge/service jika ada, jika tidak ada isi 0
   - "discount": Nilai diskon/potongan harga jika ada, jika tidak ada isi 0
   - "grand_total": subtotal + tax + service_charge - discount

6. FORMAT ANGKA
   - Semua harga dalam ANGKA PENUH tanpa pemisah ribuan
   - Contoh BENAR: 15000, 150000
   - Contoh SALAH: "15.000", "15k", 15000.0

7. YANG HARUS DIABAIKAN
   - Nomor struk/invoice/order
   - Nama kasir
   - Nomor meja
   - Metode pembayaran (tunai/kartu)
   - Kembalian
   - Nomor telepon/alamat merchant
   - Waktu transaksi (kecuali diminta)

8. VALIDASI
   - Pastikan SUM(items.total_price) = subtotal
   - Pastikan subtotal + tax + service_charge - discount = grand_total
   - Jika tidak sesuai, prioritaskan grand_total dari struk dan sesuaikan subtotal

CONTOH INPUT-OUTPUT:

Input (struk):
"""
Nasi Goreng x2    40000
Es Teh            5000
Ayam Bakar        35000
---
Subtotal         80000
Pajak 10%         8000
Total            88000
"""

Output (JSON):
{
  "items": [
    {
      "name": "Nasi Goreng",
      "quantity": 2,
      "unit_price": 20000,
      "total_price": 40000
    },
    {
      "name": "Es Teh",
      "quantity": 1,
      "unit_price": 5000,
      "total_price": 5000
    },
    {
      "name": "Ayam Bakar",
      "quantity": 1,
      "unit_price": 35000,
      "total_price": 35000
    }
  ],
  "subtotal": 80000,
  "tax": 8000,
  "service_charge": 0,
  "discount": 0,
  "grand_total": 88000
}

PENTING:
- Jangan tambahkan teks apapun selain JSON
- Jangan gunakan backticks atau markdown
- Pastikan JSON valid dan bisa di-parse
- Jika ada item yang tidak jelas, gunakan nama terbaik yang bisa dibaca
- Semua nilai number harus tanpa quotes`;