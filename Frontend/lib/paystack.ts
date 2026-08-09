// Thin wrapper around Paystack's Inline Popup checkout widget (loaded via the
// <Script src="https://js.paystack.co/v1/inline.js"> tag on the Charges page).
// The reference this produces is never trusted on its own -- the backend re-verifies
// it against Paystack's API before marking anything paid.

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  onClose?: () => void;
  callback: (response: { reference: string }) => void;
}

interface PaystackHandler {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => PaystackHandler;
    };
  }
}

function generateReference(): string {
  return `libman-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function openPaystackCheckout(options: {
  email: string;
  amountGHS: number;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}): void {
  if (typeof window === "undefined" || !window.PaystackPop) {
    throw new Error("Payment isn't ready yet -- please wait a moment and try again.");
  }
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Payments aren't configured yet.");
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: options.email,
    amount: Math.round(options.amountGHS * 100),
    currency: "GHS",
    ref: generateReference(),
    callback: (response) => options.onSuccess(response.reference),
    onClose: options.onClose,
  });
  handler.openIframe();
}
