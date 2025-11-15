from django.db import models
from django.contrib.auth.models import AbstractUser,BaseUserManager


# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    
    username = None
    name = models.CharField(max_length=200,unique=True,null=True)
    
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'   
    REQUIRED_FIELDS = []       

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
    objects = CustomUserManager()


class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.FloatField()
    image = models.ImageField(upload_to='course_images/', null=True, blank=True)

    def __str__(self):
        return self.title



class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.cart.user.email} - {self.course.title}"



class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.FloatField(default=0)
    status = models.CharField(max_length=20, default='Pending')  
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.IntegerField()
    order_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.payment_id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    price = models.FloatField()
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.order.user.email} - {self.course.title}"
