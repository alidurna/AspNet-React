using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace TaskFlow.API.Services
{
    public class MailService
    {
        private readonly IConfiguration _configuration;

        public MailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            var smtpSection = _configuration.GetSection("Smtp");
            var host = smtpSection.GetValue<string>("Host");
            var port = smtpSection.GetValue<int>("Port");
            var enableSsl = smtpSection.GetValue<bool>("EnableSsl");
            var user = smtpSection.GetValue<string>("User");
            var password = smtpSection.GetValue<string>("Password");

            var resetLink = $"http://localhost:3001/reset-password?token={resetToken}";

            var mail = new MailMessage();
            mail.From = new MailAddress(user, "TaskFlow");
            mail.To.Add(toEmail);
            mail.Subject = "Şifre Sıfırlama Bağlantınız";
            mail.Body = $"Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n{resetLink}";
            mail.IsBodyHtml = false;

            using var smtp = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, password),
                EnableSsl = enableSsl
            };

            await smtp.SendMailAsync(mail);
        }
    }
} 