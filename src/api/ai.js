import { getAllReadyMenu, getAllVariant, getAllVariantMenu } from "./api";

export async function fetchAI(pesanan) {
  let allMenu;
  let allVariants;
  let variantMenuRelations;
  try {
    allMenu = await getAllReadyMenu();
    allVariants = await getAllVariant();
    variantMenuRelations = await getAllVariantMenu();

    const prompt = `
    // ... rest of prompt
    `;

    // ... rest of code
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      isError: true,
      msg: `Failed to fetch data: ${error.message}`,
      data: null,
    };
  }
  const prompt = `
Kamu adalah SmartOrder, sistem pembuat pesanan untuk aplikasi kasir.

Berikut adalah daftar menu yang tersedia:
${JSON.stringify(allMenu)}

Berikut adalah daftar variant yang tersedia:
${JSON.stringify(allVariants)}

Berikut adalah relasi menu-variant (menu mana yang punya variant apa):
${JSON.stringify(variantMenuRelations)}

PENTING: 
- Setiap variant sudah include array 'options' di dalamnya
- variantMenuRelations berisi: { id_menu, id_variant } untuk mapping menu ke variant
- Struktur variant: { id, name, options: [{id, name, price}], multiple, required }

Tugasmu:
1. Terjemahkan pesan pelanggan menjadi list item pesanan.
2. Setiap item harus memiliki: menu_id, qty, note, variants (array).
3. **DETEKSI VARIANT:** Jika user menyebut pilihan seperti "level pedas sedang", "topping cheese", "ukuran besar", dll, masukkan ke variants array.
4. **LOGIKA PENCOCOKAN MENU (URUTAN PRIORITAS):**
   A. **Normalisasi & Typo:** Anggap "Ham Burger", "Hamburgr", atau "Ham-burger" sama dengan "Hamburger". Abaikan perbedaan spasi.
   B. **Cek Exact Match (Setelah Normalisasi):** Jika input (setelah spasi diabaikan) cocok 100% dengan nama menu, PILIH ITU.
   C. **ATURAN EKSKLUSI VARIAN (SANGAT PENTING):**
      - Kasus: Ada menu "Hamburger" dan "Hamburger Cheese".
      - Input user: "Ham Burger" (Tanpa kata "Cheese").
      - Logika: Karena user TIDAK mengetik kata "Cheese", kamu DILARANG memilih "Hamburger Cheese". Kamu WAJIB memilih "Hamburger" biasa.
      - Prinsip: Pilih nama menu yang paling pendek yang terkandung dalam input user, kecuali user secara spesifik menyebut kata tambahan (seperti "Cheese", "Jumbo", "Special").
   D. **Ambigu:** Return error "Ambiguous item" HANYA JIKA input benar-benar bisa merujuk ke dua menu berbeda yang bukan hubungan induk-varian.

5. **CATATAN:** Jika pelanggan memberi catatan yang tidak ada di variant pada menu, masukkan ke note. JANGAN masukkan ke variants!
6. **VARIANT vs NOTE:** 
   - Variant: Pilihan yang ada di menu (level pedas, topping, ukuran)
   - Note: Instruksi khusus (tanpa bawang, extra pedas, dll)
7. Format Error: Jika ambigu atau tidak ketemu, return JSON error.
8. Output HANYA JSON, TIDAK ADA teks lain.
9. Kalau ada menu yg dimana ada variant required dan user tidak mencantumkan variant nya kasih output error dan suruh user mencantumkan variant yang wajib diisi pada menu tersebut.
10. Untuk variant level pedas jika user tidak mencantumkan pilih sedang aja.
11. Selalu gunakan bahasa indonesia
12. Dan ingat sekali lagi: **VARIANT INI HARUS COCOK DENGAN RELASI DIATAS, TIDAK ADA BOLEH KOSONG JIKA ITU ADA VARIANT YANG REQUIRED ATAU WAJIB DI PILIH**

Format output jika tidak ada error:
{
 "error": null,
 "message": null,
 "result": [
  {
   menu_id: 1,
   name: "Burger",
   original_price: 25000,
   discount_price: 0,
   qty: 2,
   note: "tanpa bawang",
   variants: [
     {
       id: 1,
       name: "Level Pedas",
       required: true,
       multiple: false,
       options: [
         { id: 3, name: "Sedang", price: 0 }
       ]
     }
   ],
   subtotal: 50000
  }
 ]
}

PENTING: 
- variants adalah array KOSONG [] jika tidak ada variant yang dipilih. Jangan null atau undefined!
- Jika ada variant, format harus sesuai struktur di atas dengan id, name, required, multiple, dan options array.
- subtotal sudah termasuk harga variant!

Format output jika ada error:
{
 "error": "Ambiguous item" | "Item not found",
 "message": "Penjelasan error",
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
