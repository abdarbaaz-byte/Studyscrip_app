//
// import { NextResponse } from \"next/server\";
// import Razorpay from \"razorpay\";
//
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID || \'\',
//     key_secret: process.env.RAZORPAY_KEY_SECRET || \'\'
// });
//
// export async function POST(request: Request) {
//     try {
//         const { amount } = await request.json();
//
//         if (!amount || typeof amount !== \'number\') {
//             return NextResponse.json({ error: \"Invalid amount\" }, { status: 400 });
//         }
//
//         const options = {
//             amount: (amount * 100).toString(), // amount in the smallest currency unit
//             currency: \"INR\",
//             receipt: `receipt_order_${Date.now()}`
//         };
//
//         const order = await razorpay.orders.create(options);
//
//         if (!order) {
//             return NextResponse.json({ error: \"Failed to create order\" }, { status: 500 });
//         }
//
//         return NextResponse.json(order, { status: 200 });
//
//     } catch (error: any) {
//         console.error(\"Razorpay API Error:\", error);
//         return NextResponse.json({ error: error.message || \"An error occurred\" }, { status: 500 });
//     }
// }
