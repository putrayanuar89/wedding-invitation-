// ID Spreadsheet Anda
const SPREADSHEET_ID = "1G30cx7W6ztXUKUoA0j9UCliRh3fua6GM8J4DZwpppus";

function getDatabase() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  const action = e ? e.parameter.action : "";
  
  if (action === "getWishes") {
    return getWishes();
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, message: "Aksi tidak valid." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const namaTamu = data.nama ? String(data.nama).trim() : "";
    const ucapanText = data.ucapan ? String(data.ucapan).trim() : "";

    if (!namaTamu || !ucapanText) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: "Nama dan ucapan tidak boleh kosong." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = getDatabase();
    let sheetUcapan = ss.getSheetByName("Ucapan");
    
    // Buat sheet 'Ucapan' otomatis jika belum ada
    if (!sheetUcapan) {
      sheetUcapan = ss.insertSheet("Ucapan");
      sheetUcapan.appendRow(["Nama", "Ucapan", "Timestamp"]);
      sheetUcapan.getRange("A1:C1").setFontWeight("bold");
    }

    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy HH:mm");

    // Simpan baris baru ke sheet [Nama, Ucapan, Timestamp]
    sheetUcapan.appendRow([namaTamu, ucapanText, timestamp]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Ucapan berhasil disimpan.",
        data: { nama: namaTamu, ucapan: ucapanText, timestamp: timestamp }
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getWishes() {
  try {
    const ss = getDatabase();
    let sheetUcapan = ss.getSheetByName("Ucapan");
    
    if (!sheetUcapan) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheetUcapan.getDataRange().getValues();

    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let wishes = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][1]) {
        wishes.push({
          nama: rows[i][0],
          ucapan: rows[i][1],
          timestamp: rows[i][2] || ""
        });
      }
    }

    // Urutkan dari ucapan terbaru (paling bawah di spreadsheet dimunculkan paling awal)
    wishes.reverse();

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: wishes }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}