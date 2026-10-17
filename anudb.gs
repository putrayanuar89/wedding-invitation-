// Ganti ID di bawah ini dengan ID Spreadsheet Anda yang disalin dari URL
const SPREADSHEET_ID = "1G30cx7W6ztXUKUoA0j9UCliRh3fua6GM8J4DZwpppus";

function getDatabase() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getGuest") {
    const token = e.parameter.token;
    return getGuestByToken(token);
  } else if (action === "getWishes") {
    return getRandomWishes();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid action" }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const token = data.token;
    const ucapanText = data.ucapan;
    
    const guestData = findGuestName(token);
    if (!guestData.success) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Token tidak valid atau tidak ditemukan." }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    const namaTamu = guestData.nama;
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy HH:mm");
    
    const ss = getDatabase();
    const sheetUcapan = ss.getSheetByName("Ucapan");
    sheetUcapan.appendRow([namaTamu, ucapanText, timestamp]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      data: { nama: namaTamu, ucapan: ucapanText, timestamp: timestamp } 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function getGuestByToken(token) {
  const result = findGuestName(token);
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}

function findGuestName(token) {
  if (!token) return { success: false, message: "Token kosong" };
  
  const ss = getDatabase();
  const sheetTamu = ss.getSheetByName("Tamu");
  const rows = sheetTamu.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(token).trim()) {
      return { success: true, nama: rows[i][1] };
    }
  }
  return { success: false, message: "Token tidak ditemukan" };
}

function getRandomWishes() {
  const ss = getDatabase();
  const sheetUcapan = ss.getSheetByName("Ucapan");
  const rows = sheetUcapan.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  let wishes = [];
  for (let i = 1; i < rows.length; i++) {
    wishes.push({
      nama: rows[i][0],
      ucapan: rows[i][1],
      timestamp: rows[i][2]
    });
  }
  
  wishes.sort(() => 0.5 - Math.random());
  const selectedWishes = wishes.slice(0, 20);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: selectedWishes }))
                       .setMimeType(ContentService.MimeType.JSON);
}