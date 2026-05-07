/**
 * WEDDING INVITATION SYSTEM - CORRECTED VERSION
 * Make sure email is saved to Column N
 */

const SPREADSHEET_ID = '1oid7HguU0KOUqw2-IYENGGccYuyEVutT70CpTE-X5Is';
const SHEET_NAME = 'Invitations';

function getInvitationsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['ID', 'Groom', 'Bride', 'EventDate', 'EventTime', 
                 'ReligionDate', 'Location', 'Occasion', 'GuestName', 'GuestEmail', 
                 'ColorTheme', 'RSVP', 'Timestamp', 'EmailSent', 'CoupleEmail'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
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
          guestEmail: data[i][8] || '',
          colorTheme: data[i][9] || '#fae1dd',
          rsvp: data[i][10] || '',
          coupleEmail: data[i][14] || ''
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
    
    // Parse incoming data
    if (request.postData && request.postData.type === 'application/json') {
      params = JSON.parse(request.postData.contents);
    } else if (request.parameter) {
      params = {};
      for (let key in request.parameter) {
        params[key] = request.parameter[key];
      }
    } else if (request.postData && request.postData.contents) {
      const content = request.postData.contents;
      if (content && content.includes('=')) {
        const pairs = content.split('&');
        for (let pair of pairs) {
          const [key, value] = pair.split('=');
          if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      }
    }
    
    const action = params.action;
    const sheet = getInvitationsSheet();
    
    // CREATE INVITATION - FIXED EMAIL HANDLING
    if (action === 'createInvitation') {
      const newId = generateUniqueId(sheet);
      // Create a new sheet with the user ID
createUserSheet(newId);
      
      // CRITICAL FIX: Get email from params (your HTML sends 'email')
      // The HTML form sends 'organizerEmail' field, not 'email'
      // Try multiple possible parameter names
const coupleEmail = params.organizerEmail || params.formEmail || params.email || '';
      const groom = params.groom || 'Groom';
      const bride = params.bride || 'Bride';
      const occasion = params.occasion || 'Wedding Ceremony';
      
      const scriptUrl = ScriptApp.getService().getUrl();
      const invitationLink = `${scriptUrl}?id=${newId}`;
      
      // Log to debug
      console.log(`Creating invitation for ${groom} & ${bride}`);
      console.log(`Email received: "${coupleEmail}"`);
      console.log(`Full params: ${JSON.stringify(params)}`);
      
      // Add to spreadsheet - Email goes to Column 14 (N)
      sheet.appendRow([
  newId,                                             // Column A: ID
  groom,                                             // Column B: Groom
  bride,                                             // Column C: Bride
  params.eventDate || 'Saturday, 14 June 2026',     // Column D: EventDate
  params.eventTime || '5:30 PM',                    // Column E: EventTime
  params.religionDate || 'Wedding Ceremony',        // Column F: ReligionDate
  params.location || 'Grand Venue',                 // Column G: Location
  occasion,                                          // Column H: Occasion ✅ NEW
  '',                                                // Column I: GuestName
  '',                                                // Column J: GuestEmail
  params.colorTheme || '#fae1dd',                   // Column K: ColorTheme
  '',                                                // Column L: RSVP
  new Date(),                                        // Column M: Timestamp
  false,                                             // Column N: EmailSent
  coupleEmail                                        // Column O: CoupleEmail (was N, now O)
]);
      
      // Auto-send email to couple if provided
      let emailSent = false;
      if (coupleEmail && coupleEmail.trim() !== '' && coupleEmail !== 'no-reply@example.com') {
        try {
          emailSent = sendInvitationEmail(
            coupleEmail, groom, bride, invitationLink,
            params.eventDate || 'Saturday, 14 June 2026',
            params.eventTime || '5:30 PM',
            params.location || 'Grand Venue',
            params.religionDate || 'Wedding Ceremony'
          );
          
          if (emailSent) {
            const data = sheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
              if (data[i][0] === newId) {
                sheet.getRange(i + 1, 13).setValue(true);
                break;
              }
            }
          }
        } catch (error) {
          console.error('Email error:', error);
        }
      }
      
      output.setContent(JSON.stringify({ 
        status: 'created', 
        newId: newId,
        invitationLink: invitationLink,
        emailSent: emailSent,
        coupleEmail: coupleEmail,
        message: emailSent ? '✅ Invitation created and email sent!' : '⚠️ Invitation created but email failed.'
      }));
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
      
      sheet.getRange(rowFound, 11).setValue(response);
      sheet.getRange(rowFound, 12).setValue(new Date());
      
      output.setContent(JSON.stringify({ status: 'updated', message: 'RSVP recorded' }));
      return output;
    }
    
    // TEST EMAIL FUNCTION - Add this to test
    else if (action === 'testEmail') {
      const testEmail = params.email || Session.getActiveUser().getEmail();
      const result = sendInvitationEmail(
        testEmail, 'Test Groom', 'Test Bride', 
        'mentor2hubrsc@gmail.com', 'Today', 'Now', 'Test Venue', 'Test Ceremony'
      );
      output.setContent(JSON.stringify({ 
        status: result ? 'sent' : 'failed', 
        to: testEmail,
        message: result ? 'Check your inbox!' : 'Failed to send'
      }));
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
function sendInvitationEmail(email, groom, bride, invitationLink, eventDate, eventTime, location, ceremonyDetails) {
  try {
    const subject = `✨ Your Wedding Invitation: ${groom} & ${bride} ✨`;
    
    // Plain text version
    const plainBody = `Dear ${groom} & ${bride},\n\nYour Eternal Vows wedding invitation has been created!\n\nEvent Details:\nDate: ${eventDate}\nTime: ${eventTime}\nVenue: ${location}\nCeremony: ${ceremonyDetails}\n\nYour invitation link:\n${invitationLink}\n\nShare this link with your guests so they can RSVP.\n\nMay your journey together be filled with happiness!\n\n- Eternal Vows Team`;
    
    // HTML version (better deliverability)
    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px;">
        <h2 style="color: #9a7040;">✨ Your Wedding Invitation is Ready ✨</h2>
        <p>Dear <strong>${groom} & ${bride}</strong>,</p>
        <p>Your Eternal Vows wedding invitation has been created!</p>
        
        <div style="background: #f2ead9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Event Details:</h3>
          <p><strong>📅 Date:</strong> ${eventDate}<br>
          <strong>⏰ Time:</strong> ${eventTime}<br>
          <strong>📍 Venue:</strong> ${location}<br>
          <strong>🌿 Ceremony:</strong> ${ceremonyDetails}</p>
        </div>
        
        <div style="background: #2c2118; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
          <a href="${invitationLink}" style="color: #e8d5a3; font-size: 18px;">🔗 View Your Invitation</a>
        </div>
        
        <p>Share this link with your guests so they can RSVP.</p>
        <p style="font-style: italic;">May your journey together be filled with happiness!</p>
        <p>- Eternal Vows Team</p>
      </div>
    `;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });
    
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error}`);
    return false;
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

// Run this function once to authorize and test
function testEmailConfiguration() {
  const testEmail = Session.getActiveUser().getEmail();
  const result = sendInvitationEmail(
    testEmail, 'Test', 'Test', 'https://example.com', 
    'Today', 'Now', 'Test Venue', 'Test Ceremony'
  );
  Logger.log(`Test email sent to ${testEmail}: ${result}`);
}
/**
 * Creates a separate sheet for a user with their ID as the sheet name
 * @param {string} userId - The unique invitation ID
 * @param {object} userData - The user/invitation data
 * @returns {object} - Status of the operation
 */
/**
 * Create a new sheet with user ID as sheet name
 * @param {string} userId - The unique invitation ID
 * @returns {object} - Status of the operation
 */
function createUserSheet(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Check if sheet with this ID already exists
    let userSheet = ss.getSheetByName(userId);
    
    if (!userSheet) {
      // Create new sheet with ID as name
      userSheet = ss.insertSheet(userId);
      Logger.log(`Created new sheet: ${userId}`);
      
      // Initialize guest management structure
      initializeGuestSheet(userId);
      
      return {
        success: true,
        sheetName: userId,
        message: `Sheet "${userId}" created successfully with guest management`
      };
    } else {
      Logger.log(`Sheet ${userId} already exists`);
      return {
        success: true,
        sheetName: userId,
        message: `Sheet "${userId}" already exists`
      };
    }
    
  } catch (error) {
    console.error(`Error creating sheet: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}
