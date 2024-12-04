import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendReminderEmail(to: string, reminder: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Reminder: ${reminder.title}`,
    text: `
      This is a reminder for: ${reminder.title}
      Type: ${reminder.type}
      Description: ${reminder.description}
      Date and Time: ${new Date(reminder.datetime).toLocaleString()}
    `,
    html: `
      <h1>Reminder: ${reminder.title}</h1>
      <p><strong>Type:</strong> ${reminder.type}</p>
      <p><strong>Description:</strong> ${reminder.description}</p>
      <p><strong>Date and Time:</strong> ${new Date(reminder.datetime).toLocaleString()}</p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Reminder email sent to ${to}`)
  } catch (error) {
    console.error('Error sending reminder email:', error)
  }
}

