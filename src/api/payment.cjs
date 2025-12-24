const staticQris =
  "00020101021126610014COM.GO-JEK.WWW01189360091433588669250210G3588669250303UMI51440014ID.CO.QRIS.WWW0215ID10221630162180303UMI5204581253033605802ID5925Burger & Kebab Kudapan, B6009MOJOKERTO61056138162070703A016304C609";
// qrcode is loaded via script tag in HTML

// Utility function to calculate CRC16 checksum, ported from the PHP example
const crc16 = (str) => {
  let crc = 0xffff;
  const strlen = str.length;

  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;

    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, "0");
};

// Main logic to generate dynamic QRIS string, ported from PHP
export const generateDynamicQris = (amount) => {
  if (staticQris.length < 4) {
    throw new Error("Invalid static QRIS data.");
  }

  const qrisWithoutCrc = staticQris.substring(0, staticQris.length - 4);

  const step1 = qrisWithoutCrc.replace("010211", "010212");

  const parts = step1.split("5802ID");

  if (parts.length !== 2) {
    throw new Error(
      "QRIS data is not in the expected format (missing '5802ID')."
    );
  }

  const amountStr = String(parseInt(amount, 10)); // Remove leading zeros and decimals

  const amountTag =
    "54" + String(amountStr.length).padStart(2, "0") + amountStr;

  const payload = [parts[0], amountTag, "5802ID", parts[1]].join("");

  const finalCrc = crc16(payload);

  return payload + finalCrc;
};