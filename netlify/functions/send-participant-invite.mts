import { Context } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InviteRequest {
  projectId: string;
  participantEmail: string;
  customMessage?: string;
  researcherId: string;
  organizationId: string;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { projectId, participantEmail, customMessage, researcherId, organizationId }: InviteRequest = await req.json();

    // Validate required fields
    if (!projectId || !participantEmail || !researcherId || !organizationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify researcher has access to this project
    const { data: project, error: projectError } = await supabase
      .from('research_project')
      .select('id, title, description, organization_id')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: "Project not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate unique enrollment token
    const enrollmentToken = crypto.randomUUID();

    // Check if participant is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollment')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('participant_email', participantEmail.toLowerCase())
      .single();

    let enrollmentId: string;

    if (existingEnrollment) {
      // Update existing enrollment with new token
      const { data: updatedEnrollment, error: updateError } = await supabase
        .from('enrollment')
        .update({
          enrollment_token: enrollmentToken,
          status: 'invited',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEnrollment.id)
        .select('id')
        .single();

      if (updateError) {
        throw updateError;
      }
      enrollmentId = updatedEnrollment.id;
    } else {
      // Create new enrollment record
      const { data: newEnrollment, error: enrollmentError } = await supabase
        .from('enrollment')
        .insert({
          project_id: projectId,
          participant_email: participantEmail.toLowerCase(),
          enrollment_token: enrollmentToken,
          status: 'invited',
          enrollment_data: {
            invited_by: researcherId,
            invited_at: new Date().toISOString(),
            custom_message: customMessage
          }
        })
        .select('id')
        .single();

      if (enrollmentError) {
        throw enrollmentError;
      }
      enrollmentId = newEnrollment.id;
    }

    // Generate invite link
    const baseUrl = process.env.URL || 'http://localhost:4005';
    const inviteLink = `${baseUrl}/easyresearch/participant/join?token=${enrollmentToken}&project=${projectId}`;

    // Send email invitation
    const emailSent = await sendInviteEmail({
      to: participantEmail,
      projectTitle: project.title,
      projectDescription: project.description,
      inviteLink,
      customMessage
    });

    if (!emailSent) {
      console.warn('Failed to send email invitation');
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrollmentId,
        inviteLink,
        emailSent
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Invite error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send invite" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

async function sendInviteEmail(params: {
  to: string;
  projectTitle: string;
  projectDescription?: string;
  inviteLink: string;
  customMessage?: string;
}): Promise<boolean> {
  try {
    const emailContent = generateEmailHTML(params);
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.EMAIL_FROM || 'EasierResearch <noreply@resend.dev>';

    // If no Resend API key, log and return success (dev mode)
    if (!RESEND_API_KEY) {
      console.log('=== EMAIL (Dev Mode) ===');
      console.log(`To: ${params.to}, Subject: Invite to ${params.projectTitle}`);
      return true;
    }

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [params.to],
        subject: `You're invited to participate: ${params.projectTitle}`,
        html: emailContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

function generateEmailHTML(params: {
  to: string;
  projectTitle: string;
  projectDescription?: string;
  inviteLink: string;
  customMessage?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Participation Invitation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Research Participation Invitation</h1>
        </div>
        <div class="content">
            <h2>${params.projectTitle}</h2>
            ${params.projectDescription ? `<p>${params.projectDescription}</p>` : ''}
            
            ${params.customMessage ? `
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                    <p><strong>Message from the researcher:</strong></p>
                    <p>${params.customMessage}</p>
                </div>
            ` : ''}
            
            <p>You have been invited to participate in this research study. Your participation is voluntary and you can withdraw at any time.</p>
            
            <p style="text-align: center;">
                <a href="${params.inviteLink}" class="button">Accept Invitation & Start Survey</a>
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${params.inviteLink}">${params.inviteLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">
                <strong>What to expect:</strong><br>
                • This survey is hosted on EasierResearch, a secure research platform<br>
                • Your responses will be kept confidential<br>
                • You can save your progress and return later<br>
                • Participation typically takes 10-15 minutes
            </p>
        </div>
        <div class="footer">
            <p>This invitation was sent via EasierResearch platform</p>
            <p>If you received this email in error, you can safely ignore it.</p>
        </div>
    </div>
</body>
</html>
  `;
}

export const config = {
  path: "/api/send-participant-invite",
};
