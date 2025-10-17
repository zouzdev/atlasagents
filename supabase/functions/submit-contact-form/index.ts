import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formData: ContactFormData = await req.json();

    if (!formData.name || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ error: "Naam, email en bericht zijn verplicht" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({ error: "Ongeldig email formaat" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    console.log("Sending emails with Resend API...");
    console.log("API Key available:", resendApiKey ? "YES (length: " + resendApiKey.length + ")" : "NO");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set!");
      throw new Error("Email service not configured");
    }

      const userEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Atlas Agents <contact@atlasagents.nl>",
          to: formData.email,
          subject: "Bevestiging van je bericht aan Atlas Agents",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
                  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 900; }
                  .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; }
                  .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00d4ff; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                  .cta-button { display: inline-block; background: #00d4ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🤖 Atlas Agents</h1>
                  </div>
                  <div class="content">
                    <h2>Bedankt voor je bericht, ${formData.name}!</h2>
                    <p>We hebben je bericht goed ontvangen en zullen zo snel mogelijk contact met je opnemen.</p>

                    <div class="message-box">
                      <h3 style="margin-top: 0;">Jouw bericht:</h3>
                      <p><strong>Naam:</strong> ${formData.name}</p>
                      ${formData.company ? `<p><strong>Bedrijf:</strong> ${formData.company}</p>` : ""}
                      <p><strong>Email:</strong> ${formData.email}</p>
                      <p><strong>Bericht:</strong><br/>${formData.message}</p>
                    </div>

                    <p>Ons team bekijkt je aanvraag en zal binnen 1-2 werkdagen reageren.</p>

                    <p>Heb je nog vragen? Stuur ons gerust een email op <a href="mailto:contact@atlasagents.nl">contact@atlasagents.nl</a></p>

                    <div class="footer">
                      <p>Met vriendelijke groet,<br/><strong>Het Atlas Agents Team</strong></p>
                      <p style="font-size: 12px; color: #999;">De toekomst van werk. Intelligente AI Agents die transformeren hoe jouw organisatie werkt.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      const userEmailData = await userEmailResponse.json();
      console.log("User email response:", userEmailData, "Status:", userEmailResponse.status);

      if (!userEmailResponse.ok) {
        console.error("Failed to send user email:", userEmailData);
      }

      const adminEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Atlas Agents <contact@atlasagents.nl>",
          to: "contact@atlasagents.nl",
          subject: `Nieuw contactformulier van ${formData.name}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
                  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 900; }
                  .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; }
                  .info-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
                  .info-row { margin: 10px 0; }
                  .label { font-weight: 600; color: #555; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🔔 Nieuw Contactformulier</h1>
                  </div>
                  <div class="content">
                    <h2>Je hebt een nieuw bericht ontvangen!</h2>
                    <p>Er is een nieuw contactformulier ingediend via de Atlas Agents website.</p>

                    <div class="info-box">
                      <h3 style="margin-top: 0;">Contactgegevens:</h3>
                      <div class="info-row">
                        <span class="label">Naam:</span> ${formData.name}
                      </div>
                      <div class="info-row">
                        <span class="label">Email:</span> <a href="mailto:${formData.email}">${formData.email}</a>
                      </div>
                      ${formData.company ? `
                      <div class="info-row">
                        <span class="label">Bedrijf:</span> ${formData.company}
                      </div>
                      ` : ""}
                      <div class="info-row" style="margin-top: 20px;">
                        <span class="label">Bericht:</span><br/>
                        <div style="margin-top: 10px; padding: 15px; background: white; border-radius: 6px;">
                          ${formData.message}
                        </div>
                      </div>
                    </div>

                    <p style="margin-top: 30px;"><strong>Actie vereist:</strong> Neem binnen 1-2 werkdagen contact op met deze persoon.</p>

                    <div class="footer">
                      <p style="font-size: 12px; color: #999;">Dit is een automatische notificatie van het Atlas Agents contactformulier.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      const adminEmailData = await adminEmailResponse.json();
      console.log("Admin email response:", adminEmailData, "Status:", adminEmailResponse.status);

      if (!adminEmailResponse.ok) {
        console.error("Failed to send admin email:", adminEmailData);
      }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Emails succesvol verstuurd!",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Interne serverfout. Probeer het later opnieuw." }),
      {
      status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});