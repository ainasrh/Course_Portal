from django.urls import path
from .views import RegisterView,LoginView,AllCourseView,CourseDetailView,CartView,AddToCartView,UpdateCartItemView,RemoveCartItemView,CreateRazorpayOrderView,VerifyRazorpayPaymentView,OrdersView
    
urlpatterns = [

    path("register/",RegisterView.as_view(),name="register"),
    path("login/",LoginView.as_view(),name="login"),
    path("courses/",AllCourseView.as_view(),name="all-courses"),
    path("courses/<int:pk>/",CourseDetailView.as_view(),name="course-id"),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/item/<int:pk>/update/', UpdateCartItemView.as_view(), name='cart-item-update'),
    path('cart/item/<int:pk>/remove/', RemoveCartItemView.as_view(), name='cart-item-remove'),

    path("create-order/", CreateRazorpayOrderView.as_view(), name="create-order"),
    path("verify-payment/", VerifyRazorpayPaymentView.as_view(), name="verify-payment"),

    path("orders/", OrdersView.as_view(), name="orders"),

]

