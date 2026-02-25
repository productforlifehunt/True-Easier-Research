import type { Context, Config } from "@netlify/functions";
import Stripe from "stripe";

const stripe = new Stripe(Netlify.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Price IDs for each plan (create these in Stripe Dashboard)
const PRICE_IDS: { [key: string]: { monthly: string; annual: string } } = {
  professional: {
    monthly: Netlify.env.get("STRIPE_PRICE_PRO_MONTHLY") || "price_pro_monthly",
    annual: Netlify.env.get("STRIPE_PRICE_PRO_ANNUAL") || "price_pro_annual",
  },
  team: {
    monthly: Netlify.env.get("STRIPE_PRICE_TEAM_MONTHLY") || "price_team_monthly",
    annual: Netlify.env.get("STRIPE_PRICE_TEAM_ANNUAL") || "price_team_annual",
  },
};

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { plan, billingPeriod, customerEmail, successUrl, cancelUrl, userId, organizationId } = await req.json();

    // Validate required fields
    if (!plan || !PRICE_IDS[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userId || !organizationId) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or organization_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const priceId = PRICE_IDS[plan][billingPeriod === "annual" ? "annual" : "monthly"];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      success_url: successUrl || `${Netlify.env.get("URL")}/easyresearch/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${Netlify.env.get("URL")}/easyresearch/pricing`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          plan: plan,
          user_id: userId,
          organization_id: organizationId,
        },
      },
      metadata: {
        plan: plan,
        plan_id: plan, // Webhook expects plan_id
        billingPeriod: billingPeriod,
        user_id: userId,
        organization_id: organizationId,
      },
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/create-checkout-session",
};
