import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

/**
 * Create a Stripe customer
 */
export async function createCustomer(email: string, name: string, metadata?: Record<string, string>) {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Create an invoice
 */
export async function createInvoice({
  customerId,
  items,
  dueDate,
  description,
}: {
  customerId: string;
  items: Array<{ description: string; amount: number; quantity?: number }>;
  dueDate?: Date;
  description?: string;
}) {
  // Add invoice items
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      description: item.description,
      amount: Math.round(item.amount * 100), // Convert to cents
      quantity: item.quantity || 1,
      currency: 'usd',
    });
  }

  // Create the invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    description,
    due_date: dueDate ? Math.floor(dueDate.getTime() / 1000) : undefined,
    collection_method: 'send_invoice',
    auto_advance: false,
  });

  return invoice;
}

/**
 * Send an invoice
 */
export async function sendInvoice(invoiceId: string) {
  return stripe.invoices.sendInvoice(invoiceId);
}

/**
 * Create a payment link for an amount
 */
export async function createPaymentLink({
  amount,
  description,
  customerEmail,
  metadata,
}: {
  amount: number;
  description: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  // Create a price for the payment
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(amount * 100),
    product_data: {
      name: description,
    },
  });

  // Create the payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    customer_creation: 'if_required',
    metadata,
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      },
    },
  });

  return paymentLink;
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession({
  lineItems,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata,
}: {
  lineItems: Array<{ name: string; amount: number; quantity?: number }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.amount * 100),
        product_data: {
          name: item.name,
        },
      },
      quantity: item.quantity || 1,
    })),
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
}

/**
 * Get a customer's payment methods
 */
export async function getPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data;
}

/**
 * Retrieve an invoice
 */
export async function getInvoice(invoiceId: string) {
  return stripe.invoices.retrieve(invoiceId);
}

/**
 * List invoices for a customer
 */
export async function listInvoices(customerId: string) {
  return stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });
}
