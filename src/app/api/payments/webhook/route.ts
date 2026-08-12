import { NextResponse } from 'next/server';
import { verifyWebhookSignature, processPaymentWebhook } from '../../../../lib/paymentGateway';

/**
 * POST /api/payments/webhook
 * Step 3 & 4: Webhook Processor Endpoint
 * Handles asynchronous payment success/failure events with:
 * 1. HMAC Signature Verification (Security against spoofing)
 * 2. Idempotency Check (Duplicate webhooks safely handled)
 * 3. Raw Payload Transaction Logging
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('x-phonepe-signature') ||
      request.headers.get('x-webhook-signature') ||
      '';

    // 1. HMAC Webhook Signature Verification (Production Security)
    const isSignatureValid = verifyWebhookSignature(rawBody, signature);
    
    // In local development or testing without signature header, allow fallback parsing with warning
    if (!isSignatureValid && process.env.NODE_ENV === 'production') {
      console.warn('Unauthorized webhook attempt rejected: HMAC signature mismatch.');
      return NextResponse.json(
        { success: false, error: 'HMAC signature verification failed.' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody || '{}');
    
    // Extract Gateway Event & Order ID
    const event = payload.event || payload.type || 'payment.captured';
    const paymentEntity = payload.payload?.payment?.entity || payload.data || payload;
    const gatewayOrderId = paymentEntity.order_id || paymentEntity.merchantTransactionId || payload.gatewayOrderId;
    const gatewayPaymentId = paymentEntity.id || paymentEntity.transactionId;
    const vpa = paymentEntity.vpa || paymentEntity.upi?.vpa;

    if (!gatewayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Malformed webhook payload: missing gatewayOrderId.' },
        { status: 400 }
      );
    }

    // 2. Idempotent Transaction Processing
    const result = processPaymentWebhook({
      event,
      gatewayOrderId,
      gatewayPaymentId,
      vpa,
      rawPayload: payload,
    });

    return NextResponse.json({
      success: true,
      message: result.isDuplicate
        ? 'Webhook payload already processed (Idempotent OK).'
        : 'Webhook transaction state updated successfully.',
      transaction: result.transaction,
    });
  } catch (err: any) {
    console.error('Error in POST /api/payments/webhook:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
