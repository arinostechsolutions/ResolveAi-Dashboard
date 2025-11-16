import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validação básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Configurar o transporter de email
    // Para usar Gmail, você precisa criar uma "App Password" em:
    // https://myaccount.google.com/apppasswords
    // Configure as variáveis de ambiente: SMTP_USER e SMTP_PASS (ou GMAIL_APP_PASSWORD)
    
    const smtpUser = process.env.SMTP_USER || "holkzdevops@gmail.com";
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!smtpPass) {
      console.warn("SMTP_PASS ou GMAIL_APP_PASSWORD não configurado. Configure no arquivo .env.local");
      // Em desenvolvimento, você pode retornar sucesso mesmo sem SMTP configurado
      // Em produção, descomente a linha abaixo para exigir configuração
      // return NextResponse.json({ error: "Serviço de email não configurado" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true para 465, false para outras portas
      auth: smtpPass ? {
        user: smtpUser,
        pass: smtpPass,
      } : undefined,
    });

    // Configurar o email
    const mailOptions = {
      from: process.env.SMTP_FROM || `"ResolveAI Contact" <${process.env.SMTP_USER || "holkzdevops@gmail.com"}>`,
      to: "holkzdevops@gmail.com",
      replyTo: email,
      subject: `Nova mensagem de contato - ResolveAI: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Nova mensagem de contato - ResolveAI</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Esta mensagem foi enviada através do formulário de contato do site ResolveAI.
          </p>
        </div>
      `,
      text: `
Nova mensagem de contato - ResolveAI

Nome: ${name}
Email: ${email}

Mensagem:
${message}

---
Esta mensagem foi enviada através do formulário de contato do site ResolveAI.
      `,
    };

    // Enviar o email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

