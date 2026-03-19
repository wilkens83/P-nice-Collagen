import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Mail } from "lucide-react";
import axios from "axios";
import { API } from "../App";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const pollPaymentStatus = async (attempts = 0) => {
      const maxAttempts = 5;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus("timeout");
        return;
      }

      try {
        const response = await axios.get(`${API}/checkout/status/${sessionId}`);
        setPaymentInfo(response.data);

        if (response.data.payment_status === "paid") {
          setStatus("success");
          // Clear cart from localStorage
          localStorage.removeItem("pnice_cart_id");
          return;
        } else if (response.data.status === "expired") {
          setStatus("expired");
          return;
        }

        // Continue polling
        setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("error");
      }
    };

    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="checkout-checking">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-stone-200 border-t-[#292524] rounded-full mx-auto mb-6" />
          <h1 className="text-2xl font-serif mb-2">Processing Your Order</h1>
          <p className="text-stone-500">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="checkout-success">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle size={80} className="mx-auto text-[#7A8B69] mb-6" />
          <h1 className="text-3xl font-serif mb-4">Thank You for Your Order!</h1>
          <p className="text-stone-600 mb-8">
            Your order has been confirmed. We've sent a confirmation email with your order details.
          </p>

          {paymentInfo && (
            <div className="bg-[#F5F0EB] p-6 mb-8 text-left">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Charged</span>
                  <span className="font-medium">${(paymentInfo.amount_total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Status</span>
                  <span className="text-[#7A8B69] capitalize">{paymentInfo.payment_status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm text-stone-500">
              <Package size={18} />
              <span>You'll receive shipping updates via email</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-stone-500">
              <Mail size={18} />
              <span>Questions? Contact support@pnice.com</span>
            </div>
          </div>

          <Link to="/collections/all" className="btn-primary inline-block mt-8" data-testid="continue-shopping-success">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Error or expired states
  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="checkout-error">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-2xl font-serif mb-4">
          {status === "expired" ? "Payment Session Expired" : "Something Went Wrong"}
        </h1>
        <p className="text-stone-500 mb-6">
          {status === "expired" 
            ? "Your payment session has expired. Please try again." 
            : "We couldn't confirm your payment. Please check your email for confirmation or contact support."}
        </p>
        <div className="space-x-4">
          <Link to="/cart" className="btn-secondary">Return to Cart</Link>
          <Link to="/collections/all" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
