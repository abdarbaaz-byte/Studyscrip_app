"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PaymentHistoryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchPaymentHistory = async () => {
    if (user) {
      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const paymentHistory = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(paymentHistory);
      } catch (error) {
        toast({
          title: "Error fetching payment history",
          description: "An error occurred while fetching your payment history.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPaymentHistory();
    setIsRefreshing(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.amount / 100}</TableCell>
                    <TableCell>{payment.currency}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No payment history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistoryPage;
