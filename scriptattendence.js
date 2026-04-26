
// ==================== ATTENDANCE SYSTEM ====================
const MEMBER_SHEET_ID = '1CLmhUxbgZrdlFAs_lLxYv1e6Gqikyo7MEUDSjUxnReM';
// ⚠️ UPDATE THIS WITH YOUR CORRECT ATTENDANCE SHEET ID:
const ATTENDANCE_SHEET_ID = '1dlcXpacMoKbk-T4ice9TCr99FxKkT0bvgRDfNK07_rY';
const ATTENDANCE_SHEET_NAME = 'AttendanceLogs';

const MEMBER_COLUMNS = { SL_NO: 2, NAME: 3, PHONE: 4, DOB: 5, REG_DATE: 6, VALIDITY: 7, REG_NO: 8 };

function doGet(e) {
  const action = e?.parameter?.action;
  const callback = e?.parameter?.callback;
  let result;
  
  if (action === 'getMemberByReg' && e?.parameter?.regNo) {
    result = getMemberByRegNo(e.parameter.regNo);
  } else if (action === 'getMemberByName' && e?.parameter?.name) {
    result = getMemberByName(e.parameter.name);
  } else if (action === 'getTodayReport') {
    result = getTodayReport();
  } else if (action === 'memberCheckin') {
    result = memberCheckin(e.parameter);
  } else if (action === 'memberCheckout') {
    result = memberCheckout(e.parameter);
  } else if (action === 'guestCheckin') {
    result = guestCheckin(e.parameter);
  } else if (action === 'guestCheckout') {
    result = guestCheckout(e.parameter);
  } else {
    result = { status: 'ok', message: 'Attendance System Active' };
  }
  
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMemberByRegNo(regNo) {
  try {
    const ss = SpreadsheetApp.openById(MEMBER_SHEET_ID);
    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const searchRegNo = regNo.toString().trim();
    
    let startRow = 0;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      if (data[i][MEMBER_COLUMNS.SL_NO] === 'Sl.No') {
        startRow = i + 1;
        break;
      }
    }
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const rowRegNo = row[MEMBER_COLUMNS.REG_NO]?.toString().trim() || '';
      if (rowRegNo === searchRegNo) {
        const validity = row[MEMBER_COLUMNS.VALIDITY]?.toString().trim() || '';
        const isValid = checkValidity(validity);
        return {
          status: 'found', regNo: rowRegNo,
          name: row[MEMBER_COLUMNS.NAME]?.toString().trim() || 'Unknown',
          phone: row[MEMBER_COLUMNS.PHONE]?.toString().trim() || '',
          validity: validity, isValid: isValid.valid, validityMessage: isValid.message
        };
      }
    }
    return { status: 'not_found', regNo: searchRegNo };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function getMemberByName(name) {
  try {
    const ss = SpreadsheetApp.openById(MEMBER_SHEET_ID);
    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const searchName = name.toString().trim().toLowerCase();
    
    let startRow = 0;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      if (data[i][MEMBER_COLUMNS.SL_NO] === 'Sl.No') startRow = i + 1;
    }
    
    const matches = [];
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const rowName = row[MEMBER_COLUMNS.NAME]?.toString().trim().toLowerCase() || '';
      if (rowName.includes(searchName)) {
        matches.push({
          regNo: row[MEMBER_COLUMNS.REG_NO]?.toString().trim() || '',
          name: row[MEMBER_COLUMNS.NAME]?.toString().trim() || '',
          phone: row[MEMBER_COLUMNS.PHONE]?.toString().trim() || '',
          isValid: checkValidity(row[MEMBER_COLUMNS.VALIDITY]?.toString().trim() || '').valid
        });
      }
    }
    
    if (matches.length === 1) return { status: 'found', ...matches[0] };
    if (matches.length > 1) return { status: 'multiple', matches: matches };
    return { status: 'not_found', name: searchName };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function memberCheckin(params) {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    let sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(ATTENDANCE_SHEET_NAME);
      sheet.getRange(1, 1, 1, 10).setValues([['Date', 'Reg ID', 'Name', 'Sign In Time', 'Sign Out Time', 'Type', 'Phone', 'Day', 'Status', 'Report']]);
      sheet.setFrozenRows(1);
    }
    
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    const dayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'EEEE');
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === params.regNo && data[i][0] === dateStr && data[i][4] === '') {
        return { status: 'warning', message: 'Already checked in today!' };
      }
    }
    
    sheet.appendRow([dateStr, params.regNo, params.name, timeStr, '', 'MEMBER', params.phone || '', dayStr, 'ACTIVE', `Valid: ${params.validity || 'N/A'}`]);
    return { status: 'success', message: `✅ Check-in: ${params.name} at ${timeStr}` };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function memberCheckout(params) {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    const sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) return { status: 'error', message: 'Sheet not found' };
    
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    
    const data = sheet.getDataRange().getValues();
    let foundRow = -1, checkInTime = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === params.regNo && data[i][0] === dateStr && data[i][4] === '') {
        foundRow = i + 1;
        checkInTime = data[i][3];
        break;
      }
    }
    
    if (foundRow === -1) return { status: 'warning', message: 'No active check-in found' };
    
    let duration = '';
    if (checkInTime) {
      const diff = Math.round((new Date(`${dateStr} ${timeStr}`) - new Date(`${dateStr} ${checkInTime}`)) / 1000 / 60);
      duration = `${diff} mins`;
    }
    
    const range = sheet.getRange(foundRow, 1, 1, data[0].length);
    const rowData = range.getValues()[0];
    rowData[4] = timeStr;
    rowData[8] = 'COMPLETED';
    rowData[9] = `Duration: ${duration}`;
    range.setValues([rowData]);
    
    return { status: 'success', message: `✅ Check-out: ${params.name} at ${timeStr}, Duration: ${duration}` };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function guestCheckin(params) {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    let sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(ATTENDANCE_SHEET_NAME);
      sheet.getRange(1, 1, 1, 10).setValues([['Date', 'Reg ID', 'Name', 'Sign In Time', 'Sign Out Time', 'Type', 'Phone', 'Day', 'Status', 'Report']]);
      sheet.setFrozenRows(1);
    }
    
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    const dayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'EEEE');
    const guestId = `GUEST_${Date.now()}`;
    
    sheet.appendRow([dateStr, guestId, params.name, timeStr, '', 'GUEST', params.mobile, dayStr, 'ACTIVE', `Purpose: ${params.purpose || 'Visit'}`]);
    return { status: 'success', message: `✅ Guest check-in: ${params.name} at ${timeStr}` };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function guestCheckout(params) {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    const sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) return { status: 'error', message: 'Sheet not found' };
    
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    
    const data = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === params.name && data[i][0] === dateStr && data[i][5] === 'GUEST' && data[i][4] === '') {
        foundRow = i + 1;
        break;
      }
    }
    
    if (foundRow === -1) return { status: 'warning', message: 'Guest not found' };
    
    const range = sheet.getRange(foundRow, 1, 1, data[0].length);
    const rowData = range.getValues()[0];
    rowData[4] = timeStr;
    rowData[8] = 'COMPLETED';
    range.setValues([rowData]);
    
    return { status: 'success', message: `✅ Guest check-out: ${params.name} at ${timeStr}` };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function getTodayReport() {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    const sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) return { status: 'success', activeCount: 0, completedCount: 0, guestCount: 0, totalVisitors: 0 };
    
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const data = sheet.getDataRange().getValues();
    let activeCount = 0, completedCount = 0, guestCount = 0;
    const activeMembers = [], completedMembers = [], guests = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === today) {
        if (row[5] === 'MEMBER') {
          if (row[8] === 'ACTIVE') { activeCount++; activeMembers.push({ name: row[2], regNo: row[1], checkIn: row[3] }); }
          else if (row[8] === 'COMPLETED') { completedCount++; completedMembers.push({ name: row[2], regNo: row[1], checkIn: row[3], checkOut: row[4] }); }
        } else if (row[5] === 'GUEST') {
          guestCount++; guests.push({ name: row[2], phone: row[6], checkIn: row[3], status: row[8] });
        }
      }
    }
    
    return { status: 'success', date: today, activeCount, completedCount, guestCount, activeMembers, completedMembers, guests, totalVisitors: activeCount + completedCount + guestCount };
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function checkValidity(validityStr) {
  if (!validityStr) return { valid: false, message: 'No validity date' };
  try {
    const parts = validityStr.toString().trim().split(' ');
    let expiryDate = null;
    if (parts.length === 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
      const year = parseInt(parts[1]);
      if (monthIndex !== -1 && !isNaN(year)) expiryDate = new Date(year, monthIndex + 1, 0);
    }
    if (!expiryDate || isNaN(expiryDate.getTime())) expiryDate = new Date(validityStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (expiryDate >= today) {
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return { valid: true, message: `Valid until ${validityStr} (${daysLeft} days left)` };
    }
    return { valid: false, message: `Expired on ${validityStr}` };
  } catch(e) { return { valid: false, message: 'Invalid date format' }; }
}

function setupAttendanceSheet() {
  try {
    const ss = SpreadsheetApp.openById(ATTENDANCE_SHEET_ID);
    let sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(ATTENDANCE_SHEET_NAME);
    sheet.clear();
    sheet.getRange(1, 1, 1, 10).setValues([['Date', 'Reg ID', 'Name', 'Sign In Time', 'Sign Out Time', 'Type', 'Phone', 'Day', 'Status', 'Report']]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    Logger.log('✅ Attendance sheet ready!');
  } catch(e) { Logger.log('Error: ' + e.toString()); }
}
