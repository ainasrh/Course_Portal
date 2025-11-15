from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .models import Course,CartItem,Cart,Order,OrderItem

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    
    
    

    # hash password
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        user = authenticate(email=email,password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        data["user"] = user

        return data
    
#  Course Serilaizers ----------

class CourseSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Course
        fields = "__all__"




# Cart Serializers ------

class CartItemSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    course_price = serializers.ReadOnlyField(source='course.price')
    course_image = serializers.ImageField(source='course.image', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'course_title', 'course_price',"course_image", 'quantity']
    

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items']
        read_only_fields = ['user']
    
    def get_user(self,obj):
        return obj.user.email


# order

class OrderItemSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_image = serializers.ImageField(source="course.image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "course_title", "course_image", "price", "quantity"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"