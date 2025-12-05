/**
 * Perbaikan kode dari /npm/bluetooth-print-js@1.0.2/index.js
 * Variabel dengan nama tunggal yang tidak jelas telah diganti dengan nama yang deskriptif.
 */

// Konstanta Perintah ESC/POS untuk Printer Termal
// Semua perintah ini berfungsi untuk mengatur format teks yang akan dicetak.
const COMMANDS = {
  // Pengaturan Alignment
  ALIGN_LEFT: new Uint8Array([27, 97, 0]),  // ESC a 0
  ALIGN_CENTER: new Uint8Array([27, 97, 1]), // ESC a 1
  ALIGN_RIGHT: new Uint8Array([27, 97, 2]), // ESC a 2

  // Pengaturan Gaya Teks
  BOLD_ON: new Uint8Array([27, 69, 1]),    // ESC E 1
  BOLD_OFF: new Uint8Array([27, 69, 0]),   // ESC E 0
  UNDERLINE_ON: new Uint8Array([27, 45, 1]), // ESC - 1
  UNDERLINE_OFF: new Uint8Array([27, 45, 0]),  // ESC - 0
  DOUBLE_SIZE: new Uint8Array([29, 33, 17]), // GS ! 11h (Width x2, Height x2)
  NORMAL_SIZE: new Uint8Array([29, 33, 0]),  // GS ! 00h (Normal size)

  // Perintah baris baru
  LINE_FEED: new Uint8Array([10]), // LF
};

class PrintPlugin {
  // Properti Internal
  #textEncoder = new TextEncoder();
  #paperSize;
  #characteristic = null;

  /**
   * Menginisialisasi plugin dengan ukuran kertas default 58mm.
   * @param {string} paperSize - Ukuran kertas ('58mm' atau '80mm').
   */
  constructor(paperSize = "58mm") {
    if (paperSize !== "58mm" && paperSize !== "80mm") {
      throw new Error(
        'Invalid paper size. Only "58mm" and "80mm" are supported.'
      );
    }
    this.#paperSize = paperSize;
  }

  /**
   * Mengatur ukuran kertas saat runtime.
   * @param {string} size - Ukuran kertas baru.
   */
  setPaperSize(size) {
    this.#paperSize = size;
  }

  /**
   * Memeriksa ketersediaan Web Bluetooth API.
   * @returns {Promise<boolean>}
   */
  async checkBluetoothAvailability() {
    return navigator.bluetooth.getAvailability();
  }

  /**
   * Mengirimkan perintah reset/menghilangkan semua format (bold, underline, size, align)
   * ke printer.
   * @param {BluetoothRemoteGATTCharacteristic} characteristic - Karakteristik GATT untuk menulis data.
   */
  async #resetFormatting(characteristic) {
    if (!characteristic) return;
    // Reset Alignment (kembali ke kiri)
    await characteristic.writeValue(COMMANDS.ALIGN_LEFT.buffer);
    // Reset Ukuran (kembali ke normal)
    await characteristic.writeValue(COMMANDS.NORMAL_SIZE.buffer);
    // Reset Bold (mati)
    await characteristic.writeValue(COMMANDS.BOLD_OFF.buffer);
    // Reset Underline (mati)
    await characteristic.writeValue(COMMANDS.UNDERLINE_OFF.buffer);
  }

  /**
   * Mencetak baris kosong atau baris baru (Line Feed).
   * @param {object} options - Opsi untuk jumlah baris baru.
   * @param {number} options.count - Jumlah baris baru yang akan dicetak. Default 1.
   */
  async writeLineBreak({ count = 1 } = {}) {
    if (this.#characteristic) {
      for (let i = 0; i < count; i++) {
        await this.#characteristic.writeValue(COMMANDS.LINE_FEED.buffer);
      }
    }
  }

  /**
   * Mencetak garis putus-putus.
   */
  async writeDashLine() {
    if (this.#characteristic) {
      // 58mm = 32 karakter, 80mm = 42 karakter (diasumsikan dari kode asli)
      const charCount = this.#paperSize === "58mm" ? 32 : 42;
      const dashes = "-".repeat(charCount);

      await this.#characteristic.writeValue(this.#textEncoder.encode(dashes));
      await this.writeLineBreak();
    }
  }

  /**
   * Menggabungkan dua string menjadi satu baris dengan jarak di tengah
   * agar string kedua berada di sisi kanan kertas.
   * @param {string} leftText - Teks di sisi kiri.
   * @param {string} rightText - Teks di sisi kanan.
   * @returns {string} Teks yang sudah diformat.
   */
  #format2Column(leftText, rightText) {
    // 58mm = 32 karakter, 80mm = 40 karakter (diasumsikan dari kode asli)
    const totalColumns = this.#paperSize === "58mm" ? 32 : 40;
    const paddingLength = totalColumns - leftText.length - rightText.length;
    // Pastikan padding tidak negatif
    const spaces = " ".repeat(Math.max(0, paddingLength)); 
    
    return leftText + spaces + rightText;
  }

  /**
   * Mencetak teks dengan dua kolom (kiri dan kanan).
   * @param {string} leftText - Teks di kolom kiri.
   * @param {string} rightText - Teks di kolom kanan.
   * @param {object} options - Opsi format teks.
   * @param {boolean} options.bold - Teks tebal.
   * @param {boolean} options.underline - Teks bergaris bawah.
   * @param {('left'|'center'|'right')} options.align - Alignment baris (Meski dua kolom, alignment tetap berlaku untuk seluruh baris).
   * @param {('normal'|'double')} options.size - Ukuran teks.
   */
  async writeTextWith2Column(
    leftText,
    rightText,
    {
      bold = false,
      underline = false,
      align = "left",
      size = "normal",
    } = {}
  ) {
    if (!this.#characteristic) return;

    // 1. Terapkan Format
    bold && (await this.#characteristic.writeValue(COMMANDS.BOLD_ON.buffer));
    underline && (await this.#characteristic.writeValue(COMMANDS.UNDERLINE_ON.buffer));

    if (align === "center") {
      await this.#characteristic.writeValue(COMMANDS.ALIGN_CENTER.buffer);
    } else if (align === "right") {
      await this.#characteristic.writeValue(COMMANDS.ALIGN_RIGHT.buffer);
    }

    if (size === "double") {
      await this.#characteristic.writeValue(COMMANDS.DOUBLE_SIZE.buffer);
    }

    // 2. Tulis Teks yang sudah diformat 2 kolom
    await this.#characteristic.writeValue(
      this.#textEncoder.encode(this.#format2Column(leftText, rightText))
    );

    // 3. Reset Format dan Baris Baru
    await this.#resetFormatting(this.#characteristic);
    await this.writeLineBreak();
  }

  /**
   * Mencetak satu baris teks.
   * @param {string} text - Teks yang akan dicetak.
   * @param {object} options - Opsi format teks.
   * @param {boolean} options.bold - Teks tebal.
   * @param {boolean} options.underline - Teks bergaris bawah.
   * @param {('left'|'center'|'right')} options.align - Alignment baris.
   * @param {('normal'|'double')} options.size - Ukuran teks.
   */
  async writeText(
    text,
    {
      bold = false,
      underline = false,
      align = "left",
      size = "normal",
    } = {}
  ) {
    if (!this.#characteristic) return;

    // 1. Terapkan Format
    bold && (await this.#characteristic.writeValue(COMMANDS.BOLD_ON.buffer));
    underline && (await this.#characteristic.writeValue(COMMANDS.UNDERLINE_ON.buffer));

    if (align === "center") {
      await this.#characteristic.writeValue(COMMANDS.ALIGN_CENTER.buffer);
    } else if (align === "right") {
      await this.#characteristic.writeValue(COMMANDS.ALIGN_RIGHT.buffer);
    } else {
      // Default ke kiri jika tidak ditentukan
      await this.#characteristic.writeValue(COMMANDS.ALIGN_LEFT.buffer);
    }

    if (size === "double") {
      await this.#characteristic.writeValue(COMMANDS.DOUBLE_SIZE.buffer);
    }

    // 2. Tulis Teks
    await this.#characteristic.writeValue(this.#textEncoder.encode(text));

    // 3. Reset Format dan Baris Baru
    await this.#resetFormatting(this.#characteristic);
    await this.writeLineBreak();
  }

  /**
   * Mencoba menghubungkan ke printer Bluetooth dan mendapatkan karakteristik penulisan.
   * @param {object} callbacks - Fungsi callback.
   * @param {function(PrintPlugin): void} callbacks.onReady - Dipanggil saat koneksi berhasil.
   * @param {function(string): void} callbacks.onFailed - Dipanggil saat koneksi gagal.
   */
  async connectToPrint({ onReady, onFailed }) {
    try {
      if (!(await this.checkBluetoothAvailability())) {
        onFailed("Your device does not support Bluetooth printing.");
        return;
      }

      // Jika sudah terhubung, langsung panggil onReady
      if (this.#characteristic) {
        onReady(this);
        return;
      }

      // Mulai proses koneksi Bluetooth
      navigator.bluetooth
        .requestDevice({
          filters: [
            {
              // Menggunakan UUID Layanan Bluetooth Thermal Printer yang umum (000018f0-...)
              services: ["000018f0-0000-1000-8000-00805f9b34fb"],
            },
          ],
          // Sertakan 'optionalServices' jika perlu mendeteksi layanan lain
          optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
        })
        .then((device) => {
          console.log("Got device:", device.name);
          return device.gatt.connect();
        })
        .then((server) => {
          console.log("Connected to GATT Server");
          return server.getPrimaryService(
            "000018f0-0000-1000-8000-00805f9b34fb"
          );
        })
        .then((service) => service.getCharacteristics())
        .then((characteristics) => {
          console.log("Got characteristics");
          let writeCharacteristic = null;
          characteristics.forEach((char) => {
            console.log("Characteristic UUID: " + char.uuid);
            // Cari karakteristik yang memiliki properti 'write'
            if (char.properties.write) {
              writeCharacteristic = char;
            }
          });

          if (writeCharacteristic) {
            this.#characteristic = writeCharacteristic;
            onReady(this);
          } else {
            onFailed("No writable characteristic found for the service.");
          }
        })
        .catch((error) => {
          console.error("Bluetooth Error:", error);
          onFailed(error.message || "Connection failed.");
        });
    } catch (error) {
      console.error("Exception:", error);
      onFailed(error.message);
    }
  }
}

export default PrintPlugin;