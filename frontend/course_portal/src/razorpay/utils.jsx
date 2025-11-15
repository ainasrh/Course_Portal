
const loadRazorpayScript = async () => {
  
  if (document.getElementById("razorpay-script")) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default loadRazorpayScript