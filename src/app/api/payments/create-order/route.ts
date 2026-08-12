import { NextResponse } from 'next/server';
import { createGatewayOrder } from '../../../../lib/paymentGateway';

/**
 * POST /api/payments/create-order
 * Step 1 & 2: Order Creation & Dynamic QR / UPI Intent Generation
 * Triggers when user locks seats and clicks Checkout.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, amount, userId = 'usr_customer_1', paymentMethod = 'UPI_QR' } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: 'bookingId and amount are required parameters.' },
        { status: 400 }
      );
    }

    const orderResult = await createGatewayOrder({
      userId,
      bookingId,
      amount: Number(amount),
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      message: 'Gateway order created successfully.',
      gatewayOrderId: orderResult.gatewayOrderId,
      amount: orderResult.transaction.amount,
      currency: orderResult.transaction.currency,
      qrCodeString: orderResult.qrCodeString,
      upiIntentUrl: orderResult.upiIntentUrl,
      deepLinks: orderResult.deepLinks,
      razorpayOptions: orderResult.razorpayOptions,
      transaction: orderResult.transaction,
    });
  } catch (err: any) {
    console.error('Error in POST /api/payments/create-order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
