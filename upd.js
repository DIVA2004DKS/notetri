const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');

const uri = 'mongodb+srv://divakar2004divakar:1RyEDt8umI7yrz2v@cluster0.hzqlc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

const emailUser = 'sample13423sample@gmail.com'; // Your email address
const emailPass = 'hjqu pyka jugk mgpa'; // Your email password or app-specific password

async function sendEmail(userEmail, noteTitle, noteContent) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: userEmail,
    subject: `Note Updated: ${noteTitle}`,
    text: `Hello,

Your note has been updated.

Title: ${noteTitle}
Content: ${noteContent}

Best regards,
Your Notes App`,
    html: `<p>Hello,</p>
           <p>Your note has been updated.</p>
           <h3>Title: ${noteTitle}</h3>
           <p>${noteContent}</p>
           <p>Best regards,<br>Your Notes App</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function monitorNotes() {
  try {
    await client.connect();
    const db = client.db('test'); // Replace with your database name
    const notesCollection = db.collection('notes');
    const usersCollection = db.collection('users');

    const changeStream = notesCollection.watch();

    changeStream.on('change', async (change) => {
      if (change.operationType === 'update') {
        const noteId = change.documentKey._id;
        const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });

        if (note) {
          const userId = note.userId;
          const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
          if (user) {
            const userEmail = user.email;
            const noteTitle = note.title; // Assuming note title is stored in 'title' field
            const noteContent = note.content; // Assuming note content is stored in 'content' field
            await sendEmail(userEmail, noteTitle, noteContent);
          } else {
            console.error('User not found');
          }
        } else {
          console.error('Note not found');
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

monitorNotes().catch(console.error);
