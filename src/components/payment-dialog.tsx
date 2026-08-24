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
import { Loader2, Wallet, QrCode, CheckCircle, AlertCircle, Smartphone, HelpCircle, ChevronRight, Gift, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentRequest, getUserProfile, processCreditPurchase } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
  onConfirm: (razorpayPaymentId: string, creditUsed: number) => void; 
}

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
  
  // Credit State
  const [useCredit, setUseCredit] = useState(false);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [creditLoading, setCreditLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    if (user && open) {
        setCreditLoading(true);
        getUserProfile(user.uid).then(profile => {
            setAvailableCredit(profile?.creditBalance || 0);
            setCreditLoading(false);
        });
    }

    return () => {
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    }
  }, [user, open]);

  const creditToUse = useCredit ? Math.min(availableCredit, itemPrice) : 0;
  const amountToPay = Math.max(0, itemPrice - creditToUse);
  const isFullyCovered = amountToPay === 0;

  const makePayment = async () => {
    if (isFullyCovered) {
        handleFullCreditPurchase();
        return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Razorpay Key ID is not configured." });
      return;
    }
    
    setIsPaying(true);
    try {
        const response = await fetch('/api/razorpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountToPay }),
        });

        if (!response.ok) throw new Error('Failed to create Razorpay order');

        const order = await response.json();
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "StudyScript",
            description: `Purchase of ${itemName}`,
            order_id: order.id,
            handler: async function (response: any) {
                // Pass creditToUse to onConfirm so it gets deducted in createPurchase
                onConfirm(response.razorpay_payment_id, creditToUse); 
            },
            prefill: {
                name: user?.displayName || "Your Name",
                email: user?.email || "your.email@example.com",
            },
            theme: { color: "#3399cc" },
            modal: { ondismiss: () => setIsPaying(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (error) {
        toast({ variant: "destructive", title: "Payment Failed", description: "Could not initiate payment." });
        setIsPaying(false);
    }
  };

  const handleFullCreditPurchase = async () => {
    if (!user) return;
    setIsPaying(true);
    try {
        await processCreditPurchase(user.uid, user.email || 'Anonymous', itemId, itemName, itemType, itemPrice, creditToUse);
        toast({ title: "Purchase Successful!", description: "Amount covered by StudyScript Credit." });
        onConfirm(`CREDIT_FULL_${Date.now()}`, creditToUse);
        onOpenChange(false);
    } catch (e) {
        toast({ variant: "destructive", title: "Purchase Failed", description: "Could not process credit transaction." });
    }
    setIsPaying(false);
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
            creditUsed: creditToUse,
            amountToPay: amountToPay,
        });
        toast({
            title: "Request Submitted!",
            description: "Your payment is being verified. Access within 24 hours.",
            className: "bg-green-100 border-green-400 text-green-800"
        });
        setUpiRefId("");
        onOpenChange(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request." });
    }
    setIsSubmittingUpi(false);
  }
  
  const getUpiString = () => `upi://pay?pa=${UPI_ID}&pn=StudyScript&am=${amountToPay}&cu=INR`;
  const getQrCodeUrl = () => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getUpiString())}`;

  const totalProcessing = isProcessing || isPaying || isSubmittingUpi;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-none sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-headline font-bold pr-8">Checkout</DialogTitle>
          <DialogDescription className="text-sm">Access to "{itemName}"</DialogDescription>
        </DialogHeader>

        {/* Credit Section */}
        <div className="mt-4 p-4 rounded-xl border-2 border-primary/10 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">StudyScript Credit</span>
                </div>
                {creditLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <span className="font-black text-primary">₹{availableCredit}</span>}
            </div>
            
            {availableCredit > 0 && (
                <div className="flex items-center space-x-2 bg-white/50 p-2 rounded-lg border border-primary/10">
                    <Checkbox id="use-credit" checked={useCredit} onCheckedChange={(checked) => setUseCredit(!!checked)} />
                    <label htmlFor="use-credit" className="text-xs font-medium cursor-pointer flex-1">Use credits for this purchase</label>
                </div>
            )}
        </div>

        {/* Pricing Table */}
        <div className="bg-secondary/30 p-4 rounded-xl my-4 space-y-2 border">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Fee</span>
                <span className="font-semibold">₹{itemPrice}</span>
            </div>
            {useCredit && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Coins className="h-3 w-3"/> Credit Used</span>
                    <span>-₹{creditToUse}</span>
                </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between items-center pt-1">
                <span className="font-bold">Total Payable</span>
                <span className="text-xl font-black text-primary">₹{amountToPay}</span>
            </div>
        </div>

        {isFullyCovered ? (
             <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-green-800 text-sm">Full Amount Covered!</p>
                    <p className="text-xs text-green-700">No extra payment required. Click below to unlock instantly.</p>
                </div>
                <Button onClick={handleFullCreditPurchase} disabled={totalProcessing} size="lg" className="w-full font-black shadow-lg h-14 text-base bg-orange-600 hover:bg-orange-700">
                    {totalProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Gift className="mr-2 h-5 w-5" />}
                    Unlock with Credits Now
                </Button>
            </div>
        ) : (
            <Tabs defaultValue="upi" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12">
                    <TabsTrigger value="upi" className="font-semibold text-xs sm:text-sm">Pay with UPI</TabsTrigger>
                    <TabsTrigger value="razorpay" className="font-semibold text-xs sm:text-sm">Card / Netbanking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upi" className="py-4 space-y-4 w-full">
                    <div className="text-center p-4 bg-secondary/50 rounded-xl border border-dashed border-primary/20 w-full overflow-hidden">
                        <p className="text-xs sm:text-sm font-bold text-primary mb-3">Option 1: Scan QR or Use UPI App</p>
                        <div className="flex justify-center mb-4 max-w-full">
                            <div className="bg-white p-2 rounded-lg shadow-sm border">
                            <Image src={getQrCodeUrl()} alt="UPI QR Code" width={140} height={140} />
                            </div>
                        </div>
                        <Button 
                        onClick={() => window.location.href = getUpiString()} 
                        className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold text-sm h-auto py-3"
                        disabled={totalProcessing}
                        >
                        <Smartphone className="mr-2 h-5 w-5" /> Pay via UPI App
                        </Button>
                        <p className="text-[10px] font-semibold text-muted-foreground">UPI ID: <span className="font-mono bg-background px-1 border rounded">{UPI_ID}</span></p>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-xl border w-full">
                        <p className="text-xs sm:text-sm font-bold text-foreground mb-3">Option 2: Submit Reference ID</p>
                        <form onSubmit={handleUpiSubmit} className="space-y-3">
                            <Label htmlFor="upi-ref" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">12-Digit Reference ID</Label>
                            <Input id="upi-ref" placeholder="Enter Ref. ID from payment app" value={upiRefId} onChange={(e) => setUpiRefId(e.target.value)} required disabled={isSubmittingUpi} className="bg-background border-primary/20" />
                            <Button type="submit" disabled={totalProcessing} className="w-full font-bold h-11">
                                {isSubmittingUpi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Submit for Verification
                            </Button>
                        </form>
                    </div>

                    {/* Step Guide */}
                    <div className="p-4 border rounded-xl bg-background space-y-4 text-[10px] sm:text-xs">
                        <h4 className="font-bold flex items-center gap-2 text-primary"><Smartphone className="h-4 w-4" /> Steps / पेमेंट कैसे करें?</h4>
                        <div className="space-y-3">
                            <p>1. <strong>Pay:</strong> Click UPI App button or scan QR to pay <strong>₹{amountToPay}</strong>.</p>
                            <p>2. <strong>Reference:</strong> Copy 12-digit Ref. ID from history.</p>
                            <p>3. <strong>Submit:</strong> Paste ID above and click submit.</p>
                            <Separator />
                            <p className="italic text-orange-700 font-medium">Access is typically granted within 24 hours after verification.</p>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="razorpay" className="py-4 w-full text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-6">Instantly unlock content using Card, Netbanking, or Wallets.</p>
                    <Button onClick={makePayment} disabled={totalProcessing} size="lg" className="w-full font-bold shadow-lg h-14 text-sm sm:text-base">
                        {totalProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wallet className="mr-2 h-5 w-5" />}
                        {isPaying ? "Redirecting..." : `Pay ₹{amountToPay} Now`}
                    </Button>
                </TabsContent>
            </Tabs>
        )}
        
        <DialogFooter className="flex flex-col items-center pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={totalProcessing} className="text-muted-foreground text-xs h-8">
            Cancel & Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
