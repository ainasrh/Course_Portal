# Course Portal - E-Learning Platform

A full-stack e-learning platform with course browsing, shopping cart, and Razorpay payment integration.

## ✨ Features

- User registration and JWT authentication
- Browse and view course details
- Shopping cart with quantity management
- Razorpay payment integration
- Order history tracking
- Responsive UI with Tailwind CSS
- Admin panel for course management (course creation is admin-only)

## 🛠 Tech Stack

### Backend
- Django 5.2.8
- Django REST Framework 3.16.1
- djangorestframework-simplejwt 5.5.1
- Pillow 12.0.0
- SQLite

### Frontend
- React 19.2.0
- React Router DOM 7.9.6
- Axios 1.13.2
- Tailwind CSS 4.1.17
- Vite 7.2.2

## 🚀 Setup & Installation

### Backend Setup

1. **Navigate to project directory:**
   ```bash
   cd project
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv env
   env\Scripts\activate  # Windows
   # source env/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file in `project/` directory:**
   ```env
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_SECRET_KEY=your_razorpay_secret_key
   ```

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (for admin access):**
   ```bash
   python manage.py createsuperuser
   ```
   Access admin panel at `http://localhost:8000/admin/` to create and manage courses.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/course_portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## ▶️ Running the Application

### Start Backend
```bash
cd project
python manage.py runserver
```
Backend runs on `http://localhost:8000`

### Start Frontend
```bash
cd frontend/course_portal
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register/` | Register new user | No |
| POST | `/login/` | Login and get JWT tokens | No |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "John Doe"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### Courses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/courses/` | Get all courses | No |
| GET | `/courses/<id>/` | Get course details | No |

**Note:** Course creation is admin-only. Admins can create courses through Django admin panel at `/admin/`.

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart/` | Get user's cart | Yes |
| POST | `/cart/add/` | Add course to cart | Yes |
| PATCH | `/cart/item/<id>/update/` | Update cart item quantity | Yes |
| DELETE | `/cart/item/<id>/remove/` | Remove item from cart | Yes |

**Add to Cart Request:**
```json
{
  "course": 1
}
```

**Update Cart Item Request:**
```json
{
  "quantity": 2
}
```

### Payment
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order/` | Create Razorpay order | Yes |
| POST | `/verify-payment/` | Verify payment signature | Yes |

**Verify Payment Request:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/` | Get user's order history | Yes |

**Note:** All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

## 🗺 Frontend Routes

- `/` - Home (All courses)
- `/register` - User registration
- `/login` - User login
- `/course/:id` - Course details
- `/cart` - Shopping cart
- `/orders` - Order history
