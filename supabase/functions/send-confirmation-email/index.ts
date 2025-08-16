
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
      city?: string;
      phone?: string;
    };
  };
  email_data: EmailData;
}

const generateConfirmationEmailHTML = (
  firstName: string,
  city: string,
  confirmationUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu cuenta en SavorySearch</title>
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
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .tagline {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        .welcome-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }
        .welcome-card h2 {
          margin: 0 0 8px 0;
          font-size: 20px;
        }
        .welcome-card p {
          margin: 0;
          opacity: 0.9;
        }
        .confirm-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .confirm-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        }
        .features {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
        }
        .features h3 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          color: #4b5563;
        }
        .feature-list li::before {
          content: "✨";
          margin-right: 10px;
        }
        .alternative-text {
          font-size: 14px;
          color: #6b7280;
          margin-top: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .security-note {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin-top: 30px;
          font-size: 14px;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #9ca3af;
        }
        .footer a {
          color: #2563eb;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            🍽️ SavorySearch
          </div>
          <div class="tagline">Descubre los mejores sabores cerca de ti</div>
        </div>
        
        <div class="welcome-card">
          <h2>¡Bienvenido/a a SavorySearch!</h2>
          <p>Tu aventura culinaria está a punto de comenzar ${city ? `en ${city}` : ''}</p>
        </div>
        
        <h1 class="title">¡Hola ${firstName}! 👋</h1>
        <p class="subtitle">
          Gracias por unirte a nuestra comunidad gastronómica. Para completar tu registro y 
          comenzar a descubrir increíbles restaurantes ${city ? `en ${city}` : ''}, solo necesitas confirmar tu cuenta.
        </p>
        
        <div style="text-align: center;">
          <a href="${confirmationUrl}" class="confirm-button">
            ✅ Confirmar mi cuenta
          </a>
        </div>
        
        <div class="features">
          <h3>¿Qué puedes hacer con SavorySearch?</h3>
          <ul class="feature-list">
            <li>Descubrir restaurantes únicos ${city ? `en ${city}` : 'en tu zona'}</li>
            <li>Explorar menús detallados con información nutricional</li>
            <li>Guardar tus platos y restaurantes favoritos</li>
            <li>Filtrar por tipo de comida, dietas especiales y más</li>
            <li>Acceder a promociones y eventos exclusivos</li>
          </ul>
        </div>
        
        <div class="alternative-text">
          <strong>¿Problemas con el botón?</strong><br>
          Copia y pega este enlace en tu navegador:<br>
          <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">
            ${confirmationUrl}
          </a>
        </div>
        
        <div class="security-note">
          <strong>🔒 Seguridad:</strong> Este enlace es único y expirará en 24 horas. 
          Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.
        </div>
        
        <div class="footer">
          <p>
            <strong>SavorySearch</strong> - Tu guía gastronómica personalizada<br>
            ¿Necesitas ayuda? Responde a este correo y te ayudaremos encantados.
          </p>
          <p style="margin-top: 15px;">
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://savorysearch.com'}">Visitar SavorySearch</a>
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
    
    console.log("Received webhook payload:", payload.substring(0, 200) + "...");
    
    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type }
    } = wh.verify(payload, headers) as WebhookPayload;

    console.log("Webhook verified successfully for user:", user.email);
    console.log("Email action type:", email_action_type);

    // Only handle signup confirmations
    if (email_action_type !== 'signup') {
      console.log("Not a signup confirmation, skipping");
      return new Response('Not a signup confirmation', { status: 200 });
    }

    const firstName = user.user_metadata?.first_name || 'Usuario';
    const city = user.user_metadata?.city || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    
    // Build confirmation URL
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    console.log("Sending confirmation email to:", user.email);

    // Send confirmation email with custom domain
    const emailResponse = await resend.emails.send({
      from: "SavorySearch <noreply@resend.dev>", // Change this to your verified domain
      to: [user.email],
      subject: "🍽️ ¡Confirma tu cuenta en SavorySearch!",
      html: generateConfirmationEmailHTML(firstName, city, confirmationUrl),
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
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
