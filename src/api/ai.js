import { GoogleGenAI } from "@google/genai";
import { getAllReadyMenu } from "./api";

// ⚠️ Ganti dengan API key kamu sendiri
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log(API_KEY);
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function listSupportedModels() {
  try {
    console.log("Mengecek model yang tersedia di akun Anda...\n");

    // Panggil method listModels()
    const response = await ai.models.list();

    // Hasilnya adalah array dari object model
    const models = response.models;
    console.log(response);
  } catch (error) {
    console.error("Terjadi error saat mengambil daftar model:", error.message);
  }
}

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
2. Setiap item harus memiliki:
product_id, qty
3. note (opsional, string kosong jika tidak ada).
4. Cocokkan nama makanan/minuman dengan menu di atas.
5. Jika pelanggan memberi catatan (misal: “tidak pedas”, “jangan terlalu manis”), masukkan ke note.
6. Jika pelanggan menyebut item yang ambigu (contoh: “burger” padahal ada beberapa jenis), kembalikan response error, pesan error isi dengan bahasa manusiawi. Sertakan nama menu jangan id menu yak di pesan error. Beri tanda seru di akhir.
7. Jika salah satu status menu yg dipilih tidak ada, kembalikan response error "Item Not Found".
8. Contoh pesan error: "Maaf ada 2 menu burger yaitu burger premium dan burger medium. Mohon sebutkan pilihan burger yang anda inginkan!"
9. Jangan berikan penjelasan dan teks apapun, cukup berikan output JSON


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
    qty: kuantitinya,
    note: "catatan tiap menu",
    subtotal: menu.discount_price && menu.discount_price !== 0 ? menu.discount_price : menu.price,
    }
 ]
}

Format output jika ada error (misalnya item ambigu atau tidak ditemukan):

{
 "error": "Ambiguous item", "Item not found", "Out of stock",
 "message": "Penjelasan error",
 "result": []
}

Pesan pelanggan:
${pesanan}
  `;
console.log(prompt)
  try {
    const result = await ai.models.generateContent({
      model: "gemma-3n-e4b-it",
      contents: prompt,
    });
    let text = result.text;
    text = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");
    console.log(text);
    await listSupportedModels();
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
