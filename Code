function main() {
  var emails = GmailApp.search("from: TorahAnytime Following <following@torahanytime.com>");
  for (var i = 0; i < emails.length; i++) {
    var email = emails[i].getMessages();
    var plainBody = email[0].getPlainBody();        
    console.log("plainBody: " + plainBody);
    var subject = email[0].getSubject();
    console.log("subject: " + subject);
    var info = getInfo(plainBody);
    for (var j = 0; j < email.length; j++) {
        email[j].moveToTrash();
        }                    
    Logger.log("Email moved to Trash");
    var title = getTitle(subject);     
    console.log("Title: " + title);
    PropertiesService.getScriptProperties().setProperty('orgTitle', title);
    PropertiesService.getScriptProperties().setProperty('orgSubject', subject);
    var downloadLink = getDownloadLink(info);
    var shiur = downloadShiur(downloadLink);
    shiur.setName(title);
    var parts = Math.ceil(shiur.getBytes().length / 26214400);
    emailShiur(shiur, email[0].getBody(), 1, parts);   
  }
  removeFromTrash();
}

function getInfo(body) {
  body = body.substring(body.indexOf("https://www.torahanytime.com"));  
  var begIndex = body.indexOf("lectures?") + 11;
  var endIndex = body.indexOf("]");
  var id = body.substring(begIndex, endIndex);
  console.log("id: " + id);
  var link = "https://www.torahanytime.com/lectures/" + id;
  var info = UrlFetchApp.fetch(link);
  return info.getContentText();
}

function getTitle(subject) {
  subject = subject.substring(subject.indexOf(" by ") + 4);
  var title = subject.toLowerCase().replace(/[^a-zA-Z0-9 \u0590-\u05fe-]/g, "").replaceAll(" ", "-") + ".mp3";
  return title.replaceAll("---", "-").replaceAll("--", "-").replaceAll("-.mp3", ".mp3");
}

function getDownloadLink(text) {
  var text = text.substring(text.indexOf("audio_url") + 12);
  console.log("text: ", text);
  var endIndex = text.indexOf(".mp3\",") + 4;
  console.log("endIndex: ", endIndex);
  var downloadLink = text.substring(0, endIndex);
  console.log("Download Link: ", downloadLink);
  return downloadLink;
}

function downloadShiur(downloadLink) {
  var audio = UrlFetchApp.fetch(downloadLink);
  return audio.getBlob().getAs('audio/mp3');
}

function emailShiur(shiur, language, counter, parts) {
  var byteArray = shiur.getBytes();
  console.log("entered ES");
const maxFileSize = 26214400; //25MB Max File Size Limit by Gmail
if (counter <= 1) {
    var subject = "TA Shiur (File)"; 
  }
  else {
    var subject = "TA Shiur (File - Part " + counter + " of " + parts + ")";
    shiur.setName(PropertiesService.getScriptProperties().getProperty('orgTitle').replaceAll(".mp3", "") + "-part-" + counter + "-of-" + parts + ".mp3");

  }
if (byteArray.length <= maxFileSize) {
  GmailApp.sendEmail("slot700@gmail.com", subject, "Language: " + language + "\n" + shiur.getName() + "\nEnjoy!", {
      attachments: [shiur],
      name: 'Automatic Emailer Script'
  });
  } else {
    var part1 = byteArray.splice(0, maxFileSize);
     part1 = Utilities.newBlob(part1, 'audio/mp3', PropertiesService.getScriptProperties().getProperty('orgTitle').replaceAll(".mp3", "") + "-part-" + counter + "-of-" + parts + ".mp3");
     var part2 = Utilities.newBlob(byteArray, 'audio/mp3', PropertiesService.getScriptProperties().getProperty('orgTitle').replaceAll(".mp3", "") + "-part-" + (counter + 1) + " of " + parts + ".mp3");
      GmailApp.sendEmail("slot700@gmail.com", "TA Shiur (File - Part " + counter + " of " + parts + ")", "Language: " + language + "\n" + part1.getName() + "\nEnjoy!", {
        attachments: [part1],
        name: 'Automatic Emailer Script'
      });
        emailShiur(part2, language, ++counter, parts);        
  }
}

function removeFromTrash() {
  var email = Session.getActiveUser().getEmail();
  var threads = GmailApp.search("in:trash from:" + email + " subject:TA Shiur older_than:3d");
  var skipped = 0;
  for (var i = 0; i < threads.length; i++) {
    try {
      Gmail.Users.Threads.remove(email, threads[i].getId());
    }
    catch (err) {
      console.log(err);
      skipped++;
      continue;
    }
  }
  console.log("Removed " + (threads.length - skipped) + " emails from trash, skipped " + skipped + " emails");
}
