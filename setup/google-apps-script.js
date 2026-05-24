// ============================================================
//  Fatima & Khawar — RSVP Google Apps Script
//
//  SETUP STEPS:
//  1. Go to https://sheets.google.com and create a new sheet
//     named "RSVPs" (or any name — update SHEET_NAME below)
//  2. In the sheet, click Extensions → Apps Script
//  3. Delete everything in the editor and paste this entire file
//  4. Click Save (floppy disk icon)
//  5. Click Deploy → New deployment
//       - Type: Web app
//       - Execute as: Me
//       - Who has access: Anyone
//  6. Click Deploy → copy the Web App URL
//  7. Paste that URL into js/main.js where it says PASTE_YOUR_URL_HERE
//  8. Every RSVP submission will appear as a new row in the sheet
// ============================================================

const SHEET_NAME = 'RSVPs';

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Write column headers on first ever submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'First Name',
        'Last Name',
        'Email',
        'Attending',
        'Guests',
        'Message'
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      data.fname      || '',
      data.lname      || '',
      data.email      || '',
      data.attendance === 'yes' ? '✅ Attending' : '❌ Not Attending',
      data.attendance === 'yes' ? data.guests    : '—',
      data.message    || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
