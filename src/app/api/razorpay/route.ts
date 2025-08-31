
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// This is a placeholder for the actual API route to create a Razorpay order.
// In a real application, you would secure this properly.

export async function POST(request: NextRequest) {
  const { amount } = await request.json();

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials are not configured in environment variables." }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}
