# TorahAnytime-Shiur-Emailer
Google Apps Script to email TorahAnytime shiurim as file attachments

How it works: 1) Go to https://www.torahanytime.com/, make an account, and follow some speakers.
2) Paste the code into Google Apps Scripts, and set a trigger to run every minute.
3) Enjoy the shiurim!

Note: After the script processes an email, it sends it to the trash. If you move the original email out of the trash, the script will send you that shiur again.
Also, the script deletes all emails with attatchments from the trash after one day, because the attachments add up to take up a lot of space after only a very short time, and Gmail has a 15GB storage limit. If you don't want the script to do this, delete "removeFromTrash();" on line 18. However, if you want to keep this function, remember to enable the Gmail API service (Click the + on the services tab on the left side and choose Gmail).
