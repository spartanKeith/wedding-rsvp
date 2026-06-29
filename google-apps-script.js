/*
  Google Apps Script for RSVP Google Sheet
*/

const SHEET_NAME = "RSVP";

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = e.parameter || {};

  sheet.appendRow([
    new Date(),
    data.fullName || data.name || "",
    data.mobileNumber || data.mobile || "",
    data.email || "",
    data.attendance || data.attending || "",
    data.guestCount || data.guests || "",
    data.mealPreference || data.meal || "",
    data.dietary || "",
    data.message || "",
    data.submittedAt || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Full Name",
      "Mobile Number",
      "Email",
      "Attendance",
      "Number of Guests",
      "Meal Preference",
      "Dietary",
      "Message to Couple",
      "Submitted At"
    ]);
  }

  return sheet;
} 