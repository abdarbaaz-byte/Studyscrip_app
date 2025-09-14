
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentRequest } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";

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
  itemId: string;
  itemType: 'course' | 'subject';
  onConfirm: (razorpayPaymentId: string) => void; 
}

// Read UPI ID from environment variable for better security and configuration.
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID;

export function PaymentDialog({
  open,
  onOpenChange,
  itemName,
  itemPrice,
  isProcessing,
  itemId,
  itemType,
  onConfirm,
}: PaymentDialogProps) {

  const { toast } = useToast();
  const { user } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const [upiRefId, setUpiRefId] = useState("");
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);

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
                name: user?.displayName || "Your Name",
                email: user?.email || "your.email@example.com",
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

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiRefId.trim() || !user) {
        toast({ variant: "destructive", title: "Please enter a valid Reference ID."});
        return;
    }
    setIsSubmittingUpi(true);
    try {
        await createPaymentRequest({
            userId: user.uid,
            userName: user.email || 'Anonymous',
            itemId,
            itemTitle: itemName,
            itemType,
            itemPrice,
            upiReferenceId: upiRefId,
        });
        toast({
            title: "Request Submitted!",
            description: "Your payment is being verified. You'll get access once approved (within 24 hours).",
            className: "bg-green-100 border-green-400 text-green-800"
        });
        setUpiRefId("");
        onOpenChange(false);
    } catch (error) {
        console.error("UPI Request submission failed:", error);
        toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request. Please try again." });
    }
    setIsSubmittingUpi(false);
  }

  const totalProcessing = isProcessing || isPaying || isSubmittingUpi;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            You are purchasing access to "{itemName}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center bg-secondary p-4 rounded-lg my-4">
            <span className="font-medium text-lg">{itemName}</span>
            <span className="font-bold text-xl text-primary" dangerouslySetInnerHTML={{ __html: `&#8377;${itemPrice}` }} />
        </div>

        <Tabs defaultValue="razorpay" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="razorpay">Card / Netbanking</TabsTrigger>
                <TabsTrigger value="upi">Pay with UPI</TabsTrigger>
            </TabsList>
            <TabsContent value="razorpay" className="py-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                    You will be redirected to Razorpay to complete your payment securely.
                </p>
                 <Button onClick={makePayment} disabled={totalProcessing} className="w-full">
                    {totalProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : <Wallet className="mr-2 h-4 w-4" />}
                    {isPaying ? "Redirecting..." : isProcessing ? "Processing..." : `Pay with Razorpay`}
                </Button>
            </TabsContent>
            <TabsContent value="upi" className="py-4 space-y-4">
                {!UPI_ID ? (
                     <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <h4 className="font-bold">UPI Payment Not Configured</h4>
                        <p className="text-xs">The site administrator has not configured UPI payments yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center p-4 bg-secondary rounded-lg">
                            <p className="text-sm font-medium">1. Scan QR or use UPI ID</p>
                            <div className="flex justify-center my-2">
                                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}&pn=StudyScript&am=${itemPrice}`} alt="UPI QR Code" width={150} height={150} />
                            </div>
                             <p className="text-sm font-semibold">
                                UPI ID: <span className="font-mono p-1 rounded bg-background">{UPI_ID}</span>
                            </p>
                        </div>
                         <div className="text-left p-4 bg-secondary rounded-lg">
                            <p className="text-sm font-medium">2. Submit Reference ID for verification</p>
                             <form onSubmit={handleUpiSubmit} className="space-y-3 mt-2">
                                <Label htmlFor="upi-ref">UPI Transaction/Reference ID</Label>
                                <Input 
                                    id="upi-ref"
                                    placeholder="Enter 12-digit ID from your UPI app"
                                    value={upiRefId}
                                    onChange={(e) => setUpiRefId(e.target.value)}
                                    required
                                    disabled={isSubmittingUpi}
                                />
                                 <Button type="submit" disabled={totalProcessing} className="w-full">
                                    {isSubmittingUpi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    {isSubmittingUpi ? 'Submitting...' : 'Submit for Verification'}
                                </Button>
                             </form>
                        </div>
                         <p className="text-xs text-muted-foreground text-center flex items-center gap-2 justify-center">
                            <AlertCircle className="h-4 w-4" />
                            Access will be granted within 24 hours after verification.
                        </p>
                    </>
                )}
            </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={totalProcessing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    