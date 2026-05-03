/**
 * WEDDING INVITATION SYSTEM - Complete Working Version
 * Handles both JSON and form-urlencoded requests
 */

const SPREADSHEET_ID = '1oid7HguU0KOUqw2-IYENGGccYuyEVutT70CpTE-X5Is';
const SHEET_NAME = 'Invitations';

function getInvitationsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['ID', 'Groom', 'Bride', 'EventDate', 'EventTime', 
                     'ReligionDate', 'Location', 'GuestName', 'ColorTheme', 'RSVP', 'Timestamp'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const id = e && e.parameter ? e.parameter.id : null;
    
    if (!id) {
      output.setContent(JSON.stringify({ status: 'error', message: 'No ID parameter provided' }));
      return output;
    }
    
    const sheet = getInvitationsSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString() === id.toString()) {
        const invitation = {
          id: data[i][0],
          groom: data[i][1] || '',
          bride: data[i][2] || '',
          eventDate: data[i][3] || '',
          eventTime: data[i][4] || '',
          religionDate: data[i][5] || '',
          location: data[i][6] || '',
          guestName: data[i][7] || '',
          colorTheme: data[i][8] || '#fae1dd',
          rsvp: data[i][9] || ''
        };
        output.setContent(JSON.stringify({ status: 'success', invitation: invitation }));
        return output;
      }
    }
    
    output.setContent(JSON.stringify({ status: 'not_found', message: 'Invitation not found' }));
    return output;
    
  } catch (error) {
    output.setContent(JSON.stringify({ status: 'error', message: error.toString() }));
    return output;
  }
}

function doPost(request) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let params = {};
    
    // Handle both JSON and form-urlencoded data
    if (request.postData && request.postData.type === 'application/json') {
      // JSON format
      params = JSON.parse(request.postData.contents);
    } else if (request.parameter) {
      // Form-urlencoded format (action=create&groom=...)
      params = {};
      for (let key in request.parameter) {
        params[key] = request.parameter[key];
      }
    } else if (request.postData && request.postData.contents) {
      // Try to parse as JSON anyway
      try {
        params = JSON.parse(request.postData.contents);
      } catch (e) {
        // If it's not JSON, treat as form data
        const content = request.postData.contents;
        if (content && content.includes('=')) {
          const pairs = content.split('&');
          for (let pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
          }
        }
      }
    }
    
    const action = params.action;
    const sheet = getInvitationsSheet();
    
    // CREATE INVITATION
    if (action === 'createInvitation') {
      const newId = generateUniqueId(sheet);
      
      sheet.appendRow([
        newId,
        params.groom || 'Groom',
        params.bride || 'Bride',
        params.eventDate || 'Saturday, 14 June 2026',
        params.eventTime || '5:30 PM',
        params.religionDate || 'Wedding Ceremony',
        params.location || 'Grand Venue',
        params.guestName || 'Beloved Guest',
        params.colorTheme || '#fae1dd',
        '',
        new Date()
      ]);
      
      output.setContent(JSON.stringify({ status: 'created', newId: newId }));
      return output;
    }
    
    // UPDATE RSVP
    else if (action === 'updateRSVP') {
      const id = params.id;
      const response = params.response;
      
      if (!id) {
        output.setContent(JSON.stringify({ status: 'error', message: 'Missing ID' }));
        return output;
      }
      
      const data = sheet.getDataRange().getValues();
      let rowFound = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][0].toString() === id.toString()) {
          rowFound = i + 1;
          break;
        }
      }
      
      if (rowFound === -1) {
        output.setContent(JSON.stringify({ status: 'error', message: 'ID not found' }));
        return output;
      }
      
      sheet.getRange(rowFound, 10).setValue(response); // Column J
      sheet.getRange(rowFound, 11).setValue(new Date()); // Column K
      
      output.setContent(JSON.stringify({ status: 'updated', message: 'RSVP recorded' }));
      return output;
    }
    
    else {
      output.setContent(JSON.stringify({ status: 'error', message: 'Unknown action: ' + action }));
      return output;
    }
    
  } catch (error) {
    output.setContent(JSON.stringify({ status: 'error', message: error.toString() }));
    return output;
  }
}

function generateUniqueId(sheet) {
  const existingIds = new Set();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) existingIds.add(data[i][0].toString());
  }
  
  let newId;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  do {
    newId = '';
    for (let i = 0; i < 8; i++) {
      newId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingIds.has(newId));
  
  return newId;
}
