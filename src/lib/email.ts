import { HttpError, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

export const send = async () => {
  const brevo = await import("@getbrevo/brevo");
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!,
  );

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = "My {{params.subject}}";
  sendSmtpEmail.htmlContent = "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>";
  sendSmtpEmail.templateId = parseInt(process.env.BREVO_PURCHASE_TEMPLATE!);
  sendSmtpEmail.sender = {"name":"Happy Singing Kids","email":"contact@happysingingkids.com"};
  sendSmtpEmail.to = [{"email":"keiran.oleary@gmail.com","name":"Jane Doe"}];
  // sendSmtpEmail.cc = [{"email":"example2@example2.com","name":"Janice Doe"}];
  sendSmtpEmail.bcc = [{"email":"keiran@example.com"}];
  sendSmtpEmail.replyTo = {"email":"contact@happysingingkids.com","name":"Happy Singing Kids"};
  sendSmtpEmail.params = {"name":"Kizza","subject":"New Subject"};

  console.log("About to send")
  return apiInstance
    .sendTransacEmail(sendSmtpEmail)
    .then(data => {
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }).catch((error: HttpError) => {
      console.error(error);
      const message = `(Email error: ${error.body.message} (${error.body.code})`
      throw new Error(message)
    });
}
