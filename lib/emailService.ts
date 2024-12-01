import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject,
    text,
    html,
  }

  try {
    await sgMail.send(msg)
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendRegistrationEmail(to: string, name: string) {
  const subject = 'Registro no CardioCare - Aguardando Aprovação'
  const text = `Olá ${name},

Seu registro no CardioCare foi recebido com sucesso. Por favor, aguarde a aprovação do administrador. Enviaremos um feedback para este email assim que sua conta for revisada.

Obrigado por escolher o CardioCare!`
  const html = `
    <h1>Registro no CardioCare - Aguardando Aprovação</h1>
    <p>Olá ${name},</p>
    <p>Seu registro no CardioCare foi recebido com sucesso. Por favor, aguarde a aprovação do administrador. Enviaremos um feedback para este email assim que sua conta for revisada.</p>
    <p>Obrigado por escolher o CardioCare!</p>
  `

  await sendEmail(to, subject, text, html)
}


