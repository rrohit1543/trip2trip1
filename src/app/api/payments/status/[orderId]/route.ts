import { NextResponse } from 'next/server';
import { getTransactionStatus } from '../../../../../lib/paymentGateway';

/**
 * GET /api/payments/status/:orderId
 * Step 3: Real-Time Status Polling Endpoint
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required parameter.' },
        { status: 400 }
      );
    }

    const transaction = getTransactionStatus(orderId);

    if (!transaction) {
      return NextResponse.json(
        {
          success: true,
          status: 'PENDING',
          orderId,
          message: 'Order status pending verification.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: transaction.gatewayOrderId,
      status: transaction.status,
      transaction,
    });
  } catch (err: any) {
    console.error('Error in GET /api/payments/status/:orderId:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
