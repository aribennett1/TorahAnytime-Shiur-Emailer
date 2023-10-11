var orgSubject;
var orgTitle;
function main() {
  var emails = GmailApp.search("from: TorahAnytime Following <following@torahanytime.com>");
  for (var i = 0; i < emails.length; i++) {
    var email = emails[i].getMessages();
    orgSubject = email[0].getSubject();
    for (var j = 0; j < email.length; j++) {
          email[j].moveToTrash();
        }                    
    Logger.log("Email moved to Trash");
    orgTitle = getTitle(orgSubject);     
    var shiur = downloadShiur(getDownloadLink(getInfo(email[0].getPlainBody())));
    shiur.setName(orgTitle);
    var parts = Math.ceil(shiur.getBytes().length / 26214400);
    emailShiur(shiur, email[0].getBody(), parts);   
  }
  removeFromTrash();
}

function getInfo(body) {
  body = body.substring(body.indexOf("https://new.torahanytime.com"));  
  return UrlFetchApp.fetch(`https://www.torahanytime.com/lectures/${body.substring(body.indexOf("lectures?") + 11, body.indexOf("]"))}`).getContentText();
}

function getTitle(subject, info) {
  subject = subject.substring(subject.indexOf(" by ") + 4);
  var title = `${subject.toLowerCase().replace(/\u00A0/g, '-').replace(/[^a-zA-Z0-9 \u0590-\u05fe-]/g, "").replaceAll(" ", "-")}-${info.substring(info.indexOf(`"date_recorded":"`) + 17, info.indexOf(`","dedication"`))}.mp3`;
  return title.replaceAll("---", "-").replaceAll("--", "-").replaceAll("-.mp3", ".mp3");
}

function getDownloadLink(text) {
  var text = text.substring(text.indexOf("audio_url") + 12);
  return text.substring(0, text.indexOf(`.mp3",`) + 4);
}

function downloadShiur(downloadLink) {
  var audio = UrlFetchApp.fetch(downloadLink);
  return audio.getBlob().getAs('audio/mp3');
}

function emailShiur(shiur, body, parts) {
console.log("entered ES");
const maxFileSize = 26214400; //25MB Max File Size Limit by Gmail
  if (parts == 1) {
    GmailApp.sendEmail(Session.getActiveUser().getEmail(), `TA Shiur (File Attached) - ${orgSubject}`, "", {
      attachments: [shiur],
      name: 'TorahAnytime Following',
      htmlBody: body
  });
  console.log("Sent Email");  
} else {
  var arrayToSend;
  var arrayRemainder = shiur.getBytes();
  for (var i = 0; i < parts; i++) {
     arrayToSend = arrayRemainder.splice(0, maxFileSize);
     arrayToSend = Utilities.newBlob(arrayToSend, 'audio/mp3', `${orgTitle.replaceAll(".mp3", "")}-part-${i + 1}-of-${parts}.mp3`);
      GmailApp.sendEmail(Session.getActiveUser().getEmail(), `TA Shiur (File Attached - Part ${i + 1} of ${parts}) - ${orgSubject}`, "", {
        attachments: [arrayToSend],
        name: 'TorahAnytime Following',
        htmlBody: body
      });
      console.log(`Sent part ${i + 1}`);
    }        
  }
}


function removeFromTrash() {
  var email = Session.getActiveUser().getEmail();
  var threads = GmailApp.search(`in:trash from:${email} subject:TA Shiur older_than:3d`);
  var numSkipped = 0;
  for (var i = 0; i < threads.length; i++) {
    try {
      Gmail.Users.Threads.remove(email, threads[i].getId());
    }
    catch (err) {
      console.log(err);
      numSkipped++;
      continue;
    }
  }
  console.log(`Removed ${(threads.length - numSkipped)} emails from trash, skipped ${numSkipped} emails`);
}
