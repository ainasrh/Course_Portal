import loadRazorpayScript from "./utils";
import api from "../axios";






const handleCheckout = async (cart,navigate) => {
    const access = localStorage.getItem("access");

  try {
    // 1) Create order on backend
    const createRes = await api.post(
      "create-order/",
      {},
      { headers: { Authorization: `Bearer ${access}` } }
    );

    const { order_id, amount, key_id } = createRes.data;

    // 2) Load Razorpay SDK
    const ok = await loadRazorpayScript();
    if (!ok) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    const options = {
      key: key_id,
      amount: amount, 
      currency: "INR",
      name: "Your Company",
      description: `Order for cart ${cart.id}`,
      order_id: order_id,
      handler: async function (response) {
        try {
          await api.post(
            "verify-payment/",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${access}` } }
          );

          alert("Payment successful! Order created.");
          navigate("/orders"); 
        } catch (err) {
          console.error("Verify failed", err.response?.data || err);
          alert("Payment verification failed.");
        }
      },
      prefill: {
        email: cart.user_email || "", 
      },
      theme: { color: "#7c3aed" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Create order failed", err.response?.data || err);
    alert("Could not start payment.");
  }
};

export default handleCheckout;
