
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemPrice: number;
  isProcessing: boolean;
  onConfirm: (razorpayPaymentId: string) => void; 
}

export function PaymentDialog({
  open,
  onOpenChange,
  itemName,
  itemPrice,
  isProcessing,
  onConfirm,
}: PaymentDialogProps) {

  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    }
  }, []);

  const makePayment = async () => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Razorpay Key ID is not configured.",
      });
      return;
    }
    
    setIsPaying(true);

    try {
        const response = await fetch('/api/razorpay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: itemPrice }),
        });

        if (!response.ok) {
            throw new Error('Failed to create Razorpay order');
        }

        const order = await response.json();

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "StudyScript",
            description: `Purchase of ${itemName}`,
            order_id: order.id,
            handler: function (response: any) {
                toast({
                    title: "Payment Successful!",
                    description: `Payment ID: ${response.razorpay_payment_id}`
                });
                onConfirm(response.razorpay_payment_id); 
            },
            prefill: {
                name: "Your Name",
                email: "your.email@example.com",
                contact: "9999999999",
            },
            notes: {
                address: "StudyScript Corporate Office",
            },
            theme: {
                color: "#3399cc",
            },
            modal: {
                ondismiss: function() {
                    setIsPaying(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
                toast({
                    variant: "destructive",
                    title: "Payment Failed",
                    description: response.error.description,
                });
                setIsPaying(false);
        });
        rzp.open();

    } catch (error) {
        console.error("Payment failed", error);
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "Could not initiate payment. Please try again.",
        });
        setIsPaying(false);
    }
  };

  const totalProcessing = isProcessing || isPaying;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            You are purchasing access to "{itemName}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
            <div className="flex justify-between items-center bg-secondary p-4 rounded-lg mb-6">
                <span className="font-medium text-lg">{itemName}</span>
                <span className="font-bold text-xl text-primary">Rs. {itemPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
                You will be redirected to Razorpay to complete your payment securely.
            </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={totalProcessing}>
            Cancel
          </Button>
          <Button onClick={makePayment} disabled={totalProcessing}>
            {totalProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : <Wallet className="mr-2 h-4 w-4" />}
            {isPaying ? "Redirecting..." : isProcessing ? "Processing..." : `Pay Rs. ${itemPrice.toFixed(2)} with Razorpay`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    