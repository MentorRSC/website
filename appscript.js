/**
 * Google Apps Script for Innovation Hub Membership Form
 * Handles form submission, saves data to Google Sheets, and saves images to Google Drive
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = e.parameter;
    var now = new Date();
    
    var imageUrl = "";
    var imageSaved = false;
    
    // Handle image upload if present
    if (data.photoData && data.photoData !== "") {
      try {
        // Extract base64 image data (remove data:image/jpeg;base64, prefix)
        var base64Data = data.photoData.split(',')[1];
        
        if (base64Data) {
          // Determine image type from the data URL
          var mimeType = "image/jpeg";
          var fileExtension = "jpg";
          
          if (data.photoData.includes('data:image/png')) {
            mimeType = "image/png";
            fileExtension = "png";
          } else if (data.photoData.includes('data:image/jpeg') || data.photoData.includes('data:image/jpg')) {
            mimeType = "image/jpeg";
            fileExtension = "jpg";
          }
          
          var imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, 'photo.' + fileExtension);
          
          // Create or get folder named "Innovation Hub Photos"
          var folderName = "Innovation Hub Photos";
          var folders = DriveApp.getFoldersByName(folderName);
          var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
          
          // Create unique filename with name and timestamp
          var safeName = (data.name || "user").replace(/[^a-zA-Z0-9]/g, '_');
          var fileName = safeName + "_" + now.getTime() + "." + fileExtension;
          var file = folder.createFile(imageBlob).setName(fileName);
          
          // Get file URL (viewable link)
          imageUrl = file.getUrl();
          
          // Optional: Make file accessible to anyone with link
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          imageSaved = true;
        }
      } catch (imageError) {
        imageUrl = "Error uploading: " + imageError.toString();
        console.error("Image upload error:", imageError);
      }
    }
    
    // Prepare all data for Google Sheets
    var rowData = [
      now,                                    // A: Timestamp
      data.name || "",                        // B: Full Name
      data.email || "",                       // C: Email
      data.phone || "",                       // D: Phone Number
      data.dob || "",                         // E: Date of Birth
      data.school || "",                      // F: School/Institution
      data.paymentMode || "",                 // G: Payment Mode
      data.date || now.toLocaleDateString(),  // H: Date (Formatted)
      data.timestamp || now.toLocaleString(), // I: Submission Timestamp
      imageUrl || "No image uploaded",        // J: Image URL (Google Drive link)
      imageSaved ? "Yes" : data.photoUploaded || "No", // K: Photo Saved Status
      data.membershipFee || "₹1000",          // L: Membership Fee
      data.applicationStatus || "Pending"     // M: Application Status
    ];
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Application submitted successfully!",
      imageSaved: imageSaved,
      imageUrl: imageUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Function to set up sheet headers
 * Run this once to initialize your Google Sheet
 */
function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Check if sheet is empty, add headers
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Full Name", 
      "Email", 
      "Phone Number", 
      "Date of Birth", 
      "School/Institution", 
      "Payment Mode", 
      "Date (Formatted)", 
      "Submission Timestamp", 
      "Image URL (Google Drive)", 
      "Photo Saved", 
      "Membership Fee", 
      "Application Status"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f1f5f9");
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Optional: Test function to verify script is working
 */
function testDoPost() {
  var testData = {
    parameter: {
      name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      dob: "2000-01-01",
      school: "Test School",
      paymentMode: "online",
      date: "Mar 2026",
      timestamp: new Date().toLocaleString(),
      photoUploaded: "No",
      membershipFee: "₹1000",
      applicationStatus: "Test"
    }
  };
  
  var result = doPost(testData);
  Logger.log(result.getContent());
}
