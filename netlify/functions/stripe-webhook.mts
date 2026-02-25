import type { Context } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(`Webhook handler error: ${error.message}`, { status: 500 });
  }
};

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const organizationId = session.metadata?.organization_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !organizationId) {
    console.error("Missing user_id or organization_id in session metadata");
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update organization with subscription details (use singular table name)
  const { error } = await supabase
    .from("organization")
    .update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      plan: planId || "professional",
      subscription_status: (subscription as any).status,
      subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq("id", organizationId);

  if (error) {
    console.error("Error updating organization:", error);
    throw error;
  }

  console.log(`Subscription created for organization ${organizationId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by customer ID
  const { data: org, error: findError } = await supabase
    .from("organization")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (findError || !org) {
    console.error("Organization not found for customer:", customerId);
    return;
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let plan = "free";
  if (priceId === process.env.VITE_STRIPE_PRO_PRICE_ID) {
    plan = "professional";
  } else if (priceId === process.env.VITE_STRIPE_TEAM_PRICE_ID) {
    plan = "team";
  }

  // Update organization subscription status
  const { error } = await supabase
    .from("organization")
    .update({
      plan,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .eq("id", org.id);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  console.log(`Subscription updated for organization ${org.id}: ${(subscription as any).status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find organization by customer ID
  const { data: org, error: findError } = await supabase
    .from("organization")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (findError || !org) {
    console.error("Organization not found for customer:", customerId);
    return;
  }

  // Downgrade to free plan
  const { error } = await supabase
    .from("organization")
    .update({
      plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
    })
    .eq("id", org.id);

  if (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }

  console.log(`Subscription canceled for organization ${org.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find organization and notify
  const { data: org } = await supabase
    .from("organization")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (org) {
    // Update subscription status to past_due
    await supabase
      .from("organization")
      .update({ subscription_status: "past_due" })
      .eq("id", org.id);

    console.log(`Payment failed for organization ${org.id}`);
  }
}
