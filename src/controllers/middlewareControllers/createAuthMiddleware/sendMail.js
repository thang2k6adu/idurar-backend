import { emailVerification } from '~/emailTemplate/emailVerification'
import { Resend } from 'resend'

export const sendMail = async ({
  email,
  name,
  link,
  idurar_app_mail,
  subject = 'Verify your email | IDURAR',
  type = 'passwordVerification',
  emailToken
}) => {
  const resend = new Resend(process.env.RESEND_API)

  console.log(idurar_app_mail)
  const { data } = await resend.emails.send({
    from: idurar_app_mail,
    to: email,
    subject,
    html: emailVerification({ name, link }),
  })

  // {
  //   "id": "12345678-abcd-efgh-ijkl-1234567890ab",
  //   "created_at": "2025-06-28T13:30:00.000Z",
  //   "to": ["user@example.com"],
  //   "from": "noreply@idurarapp.com",
  //   "subject": "Verify your email | IDURAR",
  //   "html": "<html>...</html>"
  // }
  return data
}
