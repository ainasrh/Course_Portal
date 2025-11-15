import requests
import hmac
import hashlib
from rest_framework.response import Response
from rest_framework import generics, permissions,status
from rest_framework.views import APIView
from .serializers import RegisterSerializer,LoginSerializer,CourseSerializer,CartItemSerializer,CartSerializer,OrderSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course,Cart,CartItem,Order,OrderItem
from rest_framework.permissions import IsAuthenticated
import os
from dotenv import load_dotenv

# Create your views here.
load_dotenv()

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()



    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )

        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        print(request.data)
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
            },
            "message": "Login successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token)
            
        }, status=status.HTTP_200_OK)


# Course Section

class AllCourseView(generics.ListAPIView):
    serializer_class = CourseSerializer 
    queryset = Course.objects.all()

class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()


# Cart Section -------



class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        cart, cart_created = Cart.objects.get_or_create(user=request.user)
        course_id = request.data.get("course")

        
        item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            course_id=course_id,
        )

        if not item_created:
            item.quantity += 1
            item.save()

        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class UpdateCartItemView(generics.UpdateAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]




class RemoveCartItemView(generics.DestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]



# Checkout Views 

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_SECRET_KEY") 

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
    
        user = request.user

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found"}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = CartItem.objects.filter(cart=cart)
        if not cart_items.exists():
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total_rupees = sum(item.course.price * item.quantity for item in cart_items)
        amount_paise = int(total_rupees * 100)  #

        payload = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"cart_{cart.id}_user_{user.id}",
            "payment_capture": 1,
        }

        auth = (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
        response = requests.post("https://api.razorpay.com/v1/orders", auth=auth, data=payload)

        if response.status_code not in [200, 201]:
            return Response(
                {"detail": "Failed to create Razorpay order", "error": response.json()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data = response.json()

        return Response({
            "order_id": data["id"],
            "amount": data["amount"],
            "currency": data["currency"],
            "key_id": RAZORPAY_KEY_ID
        })


class VerifyRazorpayPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        user = request.user
        data = request.data

        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not (razorpay_order_id and razorpay_payment_id and razorpay_signature):
            return Response({"detail": "Missing payment parameters"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify signature  
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
        generated_signature = hmac.new(RAZORPAY_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(generated_signature, razorpay_signature):
            return Response({"detail": "Invalid payment signature"}, status=status.HTTP_400_BAD_REQUEST)

        # Payment veried creaet order
        cart = Cart.objects.get(user=user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(item.course.price * item.quantity for item in cart_items)
        amount_paise = int(total_amount * 100)

        order = Order.objects.create(
            user=user,
            order_id=razorpay_order_id,
            amount=amount_paise,
            status="paid",
            payment_id=razorpay_payment_id
        )

        # Create OrderItems from cart
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                course=item.course,
                price=item.course.price,
                quantity=item.quantity
            )

        # Clear cart
        cart_items.delete()

        return Response({"detail": "Payment verified and order created successfully"}, status=status.HTTP_200_OK)
    


class OrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')