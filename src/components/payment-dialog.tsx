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
import { Loader2, Wallet, QrCode, CheckCircle, AlertCircle, Smartphone, HelpCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentRequest } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  itemType: 'course' | 'subject' | 'batch';
  onConfirm: (razorpayPaymentId: string) => void; 
}

// Fallback UPI ID for testing
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "studyscript@axl";

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
  
  const getUpiString = () => {
    return `upi://pay?pa=${UPI_ID}&pn=StudyScript&am=${itemPrice}&cu=INR`;
  };

  const getQrCodeUrl = () => {
    const upiData = getUpiString();
    const encodedUpiData = encodeURIComponent(upiData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUpiData}`;
  };

  const handlePayViaUpiApp = () => {
    const upiUrl = getUpiString();
    window.location.href = upiUrl;
  };

  const totalProcessing = isProcessing || isPaying || isSubmittingUpi;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-headline font-bold pr-8">Complete Your Purchase</DialogTitle>
          <DialogDescription className="text-sm">
            You are purchasing access to "{itemName}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-secondary p-4 rounded-lg my-4 gap-2 w-full overflow-hidden">
            <span className="font-medium text-base sm:text-lg truncate max-w-full">{itemName}</span>
            <span className="font-bold text-lg sm:text-xl text-primary shrink-0">Rs. {itemPrice}</span>
        </div>

        <Tabs defaultValue="upi" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12">
                <TabsTrigger value="upi" className="font-semibold text-xs sm:text-sm">Pay with UPI</TabsTrigger>
                <TabsTrigger value="razorpay" className="font-semibold text-xs sm:text-sm">Card / Netbanking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upi" className="py-4 space-y-4 w-full">
                <div className="text-center p-4 bg-secondary/50 rounded-xl border border-dashed border-primary/20 w-full overflow-hidden">
                    <p className="text-xs sm:text-sm font-bold text-primary mb-3">Option 1: Scan QR or Use UPI App</p>
                    <div className="flex justify-center mb-4 max-w-full">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Image src={getQrCodeUrl()} alt="UPI QR Code" width={140} height={140} className="sm:w-[160px] sm:h-[160px]" />
                        </div>
                    </div>
                    
                    <Button 
                      variant="default" 
                      onClick={handlePayViaUpiApp} 
                      className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold text-sm h-auto py-3 whitespace-normal leading-tight"
                      disabled={totalProcessing}
                    >
                      <Smartphone className="mr-2 h-5 w-5 shrink-0" />
                      Pay via UPI App (GPay, PhonePe, etc.)
                    </Button>

                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground break-all">
                        UPI ID: <span className="font-mono p-1 rounded bg-background select-all border border-border/50">{UPI_ID}</span>
                    </p>
                </div>

                <div className="text-left p-4 bg-secondary/30 rounded-xl border w-full">
                    <p className="text-xs sm:text-sm font-bold text-foreground mb-3">Option 2: Submit Reference ID</p>
                      <form onSubmit={handleUpiSubmit} className="space-y-3">
                        <Label htmlFor="upi-ref" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">UPI Transaction/Reference ID</Label>
                        <Input 
                            id="upi-ref"
                            placeholder="12-digit ID from your app"
                            value={upiRefId}
                            onChange={(e) => setUpiRefId(e.target.value)}
                            required
                            disabled={isSubmittingUpi}
                            className="bg-background border-primary/20 focus:border-primary w-full"
                        />
                        <Button type="submit" disabled={totalProcessing} className="w-full font-bold h-11">
                            {isSubmittingUpi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {isSubmittingUpi ? 'Submitting...' : 'Submit for Verification'}
                        </Button>
                      </form>
                </div>

                <div className="p-4 border rounded-xl bg-background space-y-4 w-full overflow-hidden">
                  <h4 className="font-bold flex items-center gap-2 text-xs sm:text-sm text-primary">
                    <Smartphone className="h-4 w-4" />
                    How to pay? / पेमेंट कैसे करें?
                  </h4>
                  <div className="space-y-4 text-[10px] sm:text-xs">
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
                      <div className="space-y-0.5">
                        <p className="font-semibold">Click "Pay via UPI App" or scan QR.</p>
                        <p className="text-muted-foreground">"Pay via UPI App" बटन पर क्लिक करें या QR स्कैन करें।</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
                      <div className="space-y-0.5">
                        <p className="font-semibold">Complete payment in your UPI app.</p>
                        <p className="text-muted-foreground">अपने UPI ऐप में जाकर पेमेंट पूरा करें।</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
                      <div className="space-y-0.5">
                        <p className="font-semibold">Copy the 12-digit Ref. ID.</p>
                        <p className="text-muted-foreground">पेमेंट हिस्ट्री से 12-अंकों का Reference ID कॉपी करें।</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">4</div>
                      <div className="space-y-0.5">
                        <p className="font-semibold">Paste Ref. ID above and click "Submit".</p>
                        <p className="text-muted-foreground">ऊपर दिए गए बॉक्स में ID पेस्ट करें और "Submit" करें।</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-2 w-full overflow-hidden">
                  <h4 className="font-bold flex items-center gap-2 text-xs sm:text-sm text-orange-800">
                    <HelpCircle className="h-4 w-4" />
                    Payment Issues? / पेमेंट की समस्या?
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[10px] sm:text-[11px] text-orange-900/80 leading-relaxed">
                    <li>Verification typically takes <strong>24 hours</strong>.</li>
                    <li>वेरिफिकेशन में आमतौर पर <strong>24 घंटे</strong> लगते हैं।</li>
                    <li>If access is not granted after 24 hours, contact us via <strong>Global Support Chat</strong>.</li>
                    <li>यदि 24 घंटे बाद भी एक्सेस न मिले, तो <strong>सपोर्ट चैट</strong> पर मैसेज करें।</li>
                  </ul>
                </div>
            </TabsContent>
            
            <TabsContent value="razorpay" className="py-4 w-full">
                <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6 px-4">
                    Instantly unlock content using Card, Netbanking, or Wallets via Razorpay secure gateway.
                </p>
                 <Button onClick={makePayment} disabled={totalProcessing} size="lg" className="w-full font-bold shadow-lg h-14 text-sm sm:text-base">
                    {totalProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : <Wallet className="mr-2 h-5 w-5" />}
                    {isPaying ? "Redirecting..." : isProcessing ? "Processing..." : `Pay Rs. ${itemPrice} Now`}
                </Button>
            </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col items-center pt-2 w-full">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={totalProcessing} className="text-muted-foreground text-[10px] sm:text-xs h-8 hover:bg-transparent">
            Cancel & Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
