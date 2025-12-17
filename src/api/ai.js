import { getAllReadyMenu } from "./api";

export async function fetchAI(pesanan) {
  const result = await getAllReadyMenu();
  if (result.error) {
    console.log(result.error);
    return;
  }
  const allMenu = result.data;
  const prompt = `
Kamu adalah SmartOrder, sistem pembuat pesanan untuk aplikasi kasir.
Berikut adalah daftar menu yang tersedia:

${JSON.stringify(allMenu)}

Tugasmu:
1. Terjemahkan pesan pelanggan menjadi list item pesanan.
2. Setiap item harus memiliki: product_id, qty.
3. note (opsional, string kosong jika tidak ada).
4. **LOGIKA PENCOCOKAN (URUTAN PRIORITAS):**
   A. **Normalisasi & Typo:** Anggap "Ham Burger", "Hamburgr", atau "Ham-burger" sama dengan "Hamburger". Abaikan perbedaan spasi.
   B. **Cek Exact Match (Setelah Normalisasi):** Jika input (setelah spasi diabaikan) cocok 100% dengan nama menu, PILIH ITU.
   C. **ATURAN EKSKLUSI VARIAN (SANGAT PENTING):**
      - Kasus: Ada menu "Hamburger" dan "Hamburger Cheese".
      - Input user: "Ham Burger" (Tanpa kata "Cheese").
      - Logika: Karena user TIDAK mengetik kata "Cheese", kamu DILARANG memilih "Hamburger Cheese". Kamu WAJIB memilih "Hamburger" biasa.
      - Prinsip: Pilih nama menu yang paling pendek yang terkandung dalam input user, kecuali user secara spesifik menyebut kata tambahan (seperti "Cheese", "Jumbo", "Special").
   D. **Ambigu:** Return error "Ambiguous item" HANYA JIKA input benar-benar bisa merujuk ke dua menu berbeda yang bukan hubungan induk-varian (misal: "Kopi" padahal ada "Kopi Hitam" dan "Kopi Susu" -> ini ambigu karena tidak ada menu bernama cuma "Kopi").

5. Jika pelanggan memberi catatan (misal: “tidak pedas”), masukkan ke note.
6. Format Error: Jika ambigu atau tidak ketemu, return JSON error.
7. Output HANYA JSON.

Format output jika tidak ada error:
{
 "error": null,
 "message": null,
 "result": [
  {
   menu_id: menu.id,
   name: menu.name,
   original_price: menu.price,
   discount_price: menu.discount_price || 0,
   qty: kuantitas,
   note: "catatan",
   subtotal: menu.discount_price || menu.price,
   }
 ]
}

Format output jika ada error:
{
 "error": "Ambiguous item" | "Item not found",
 "message": "Sebutkan nama menu (bukan ID) yang bikin bingung",
 "result": []
}

Pesan pelanggan:
${pesanan}
`;
  try {
    console.log(prompt);
    const res = await fetch("/.netlify/functions/chat-groq", {
      method: "POST",
      body: JSON.stringify({ message: prompt }),
    });
    if (!res.ok) {
      throw new Error(
        `Network response was not ok: ${res.status} ${res.statusText}`
      );
    }
    const result = await res.json();
    let text = result.text;
    text = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");

    const data = JSON.parse(text);
    if (data.error) {
      return {
        isError: true,
        msg: `${data.error}: ${data.message || ""}`,
        data: null,
      };
    }
    return { isError: false, msg: null, data: data };
  } catch (error) {
    return {
      isError: true,
      msg: error.message,
      data: null,
    };
  }
}
