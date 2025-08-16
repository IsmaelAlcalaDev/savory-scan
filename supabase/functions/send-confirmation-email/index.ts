
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

interface WebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
    };
  };
  email_data: EmailData;
}

const generateConfirmationEmailHTML = (
  firstName: string,
  confirmationUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu cuenta</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        .confirm-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: background-color 0.2s;
        }
        .confirm-button:hover {
          background-color: #1d4ed8;
        }
        .alternative-text {
          font-size: 14px;
          color: #6b7280;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #9ca3af;
        }
        .security-note {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px;
          margin-top: 20px;
          font-size: 14px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍽️ SavorySearch</div>
        </div>
        
        <h1 class="title">¡Hola ${firstName}!</h1>
        <p class="subtitle">
          Gracias por registrarte en SavorySearch. Para completar tu registro y activar tu cuenta, 
          necesitas confirmar tu dirección de correo electrónico.
        </p>
        
        <div style="text-align: center;">
          <a href="${confirmationUrl}" class="confirm-button">
            ✅ Confirmar mi cuenta
          </a>
        </div>
        
        <div class="alternative-text">
          <strong>¿No puedes hacer clic en el botón?</strong><br>
          Copia y pega este enlace en tu navegador:<br>
          <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">
            ${confirmationUrl}
          </a>
        </div>
        
        <div class="security-note">
          <strong>⚠️ Nota de seguridad:</strong> Este enlace expirará en 24 horas por tu seguridad. 
          Si no solicitaste esta cuenta, puedes ignorar este correo.
        </div>
        
        <div class="footer">
          <p>
            Este correo fue enviado desde SavorySearch<br>
            Si tienes problemas, contáctanos respondiendo a este correo.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type }
    } = wh.verify(payload, headers) as WebhookPayload;

    // Only handle signup confirmations
    if (email_action_type !== 'signup') {
      return new Response('Not a signup confirmation', { status: 200 });
    }

    const firstName = user.user_metadata?.first_name || 'Usuario';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    
    // Build confirmation URL
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "SavorySearch <noreply@resend.dev>",
      to: [user.email],
      subject: "🍽️ Confirma tu cuenta en SavorySearch",
      html: generateConfirmationEmailHTML(firstName, confirmationUrl),
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send confirmation email"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
