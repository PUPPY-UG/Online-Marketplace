# UniTrade – Campus Online Marketplace for University Students

**Uganda Christian University (UCU) – Mukono Campus**  
**Course:** MGT3151 – E-Business, E-Commerce and E-Governance  
**Project Option:** Option B – E-Commerce  
**Application Title:** UniTrade – Campus Online Marketplace for University Students  
**Status:** Complete Working Minimum Viable Product (MVP)  

---

## 1. Project Overview & Academic Purpose

**UniTrade** is a specialised, modern, and secure web-based e-commerce marketplace engineered specifically for students at **Uganda Christian University (UCU)** to buy, sell, and exchange pre-owned student essentials within their verified university community.

### Problem Statement Addressed
Prior to UniTrade, campus commerce occurred through disorganized, spam-filled WhatsApp groups, unmonitored Facebook posts, and physical notice boards scattered around Hamu Mukasa Library, Nkoyoyo Hall, and the Guild Canteen. These legacy channels led to:
- Frequent student scams and fake profiles.
- Unstructured bargaining and price gouging.
- Missed opportunities for students departing hostels to liquidate textbooks and appliances.
- High transaction friction and no transaction history.

### Solution Delivered
UniTrade replaces these chaotic methods with a centralized, verified digital marketplace featuring:
- **Role-Based Access Control (RBAC)** for Student Buyers, Student Sellers, and Campus Administrators.
- **Ugandan Shilling (UGX)** currency pricing tailored to student budgets.
- **Curated Campus Categories** (Textbooks, Electronics, Clothing, Accommodation/Hostel Items, Sports, Essentials).
- **Physical Campus Handover Points** (Hamu Mukasa Library, Tech Park, Nkoyoyo Hall, Agape Hall, Sabiti Hall).
- **Simulated Payment Gateways** (MTN MoMo, Airtel Money, Cash on Pickup) for demonstration with zero financial risk.
- **Visual Order Progression Tracking** (`Pending` → `Paid` → `Ready for Pickup` → `Completed`).
- **Post-Fulfilment Seller Ratings & Reviews** to build trust within the university community.

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM v6 |
| **Backend** | Node.js (v20 LTS), Express.js (RESTful APIs), Multer (Image Uploads), CORS, Dotenv |
| **Database** | MySQL (with `mysql2/promise` driver) + Built-in Persistent Relational Engine Fallback |
| **Authentication & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, RBAC middleware, input sanitization |
| **Deployment & Build** | Single-port integrated production serving (`PORT 5000`) or dual hot-reload development (`5173` & `5000`) |

---

## 3. Demonstration Accounts & Login Credentials

All demonstration accounts have been pre-seeded into the system with realistic Ugandan student names, UCU email addresses, hostel residences, active listings, and order histories.

**Universal Demonstration Password:** `UniTrade@2026`

| Role | Student Name | Campus Email | Campus Residence | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dennis Kibirige | `admin@unitrade.ucu.ac.ug` | Administration Building | `UniTrade@2026` |
| **Seller 1** | Grace Akello | `grace.seller@ucu.ac.ug` | Agape Hall, Block B, Room 204 | `UniTrade@2026` |
| **Seller 2** | Emmanuel Kato | `emmanuel.seller@ucu.ac.ug` | Soba Hostel, Room 14 | `UniTrade@2026` |
| **Seller 3** | Fiona Tumusiime | `fiona.seller@ucu.ac.ug` | Bishop Tucker Hall, Room 12 | `UniTrade@2026` |
| **Buyer 1** | Brian Okello | `brian.buyer@ucu.ac.ug` | Sabiti Hall, Room 108 | `UniTrade@2026` |
| **Buyer 2** | Sarah Namubiru | `sarah.buyer@ucu.ac.ug` | Allan Galpin Hall, Room 305 | `UniTrade@2026` |
| **Buyer 3** | David Mukasa | `david.buyer@ucu.ac.ug` | Bugujju Off-Campus Residency | `UniTrade@2026` |

> **Examiner Convenience:** The login interface includes **1-Click Quick Demo Login buttons** (`Buyer`, `Seller`, `Admin`) that instantly authenticate and route you to the appropriate role dashboard with a single click.

---

## 4. Database Architecture & Relational Schema

The database consists of **8 core relational tables** with primary keys, foreign keys, cascade constraints, and indexes.

### Relational Schema Diagram
```
                     +-------------------+
                     |       USERS       |
                     +-------------------+
                     | id (PK)           |
                     | full_name         |
                     | email (UQ)        |
                     | role              |
                     +---------+---------+
                               |
         +---------------------+---------------------+
         | 1:N (as seller)     | 1:N (as buyer)      | 1:1
         v                     v                     v
+-------------------+ +-------------------+ +-------------------+
|       ITEMS       | |      ORDERS       | |       CART        |
+-------------------+ +-------------------+ +-------------------+
| id (PK)           | | id (PK)           | | id (PK)           |
| seller_id (FK)    | | order_ref (UQ)    | | user_id (FK, UQ)  |
| title             | | buyer_id (FK)     | +---------+---------+
| price (UGX)       | | order_status      |           | 1:N
| category          | | payment_status    |           v
| condition_state   | | pickup_location   | +-------------------+
| is_available      | +---------+---------+ |    CART_ITEMS     |
+---------+---------+           |           +-------------------+
          |                     |           | id (PK)           |
          | 1:N                 | 1:N       | cart_id (FK)      |
          v                     v           | item_id (FK)      |
+-----------------------------------------+ | quantity          |
|               ORDER_ITEMS               | +-------------------+
+-----------------------------------------+
| id (PK)                                 |
| order_id (FK)                           |
| item_id (FK)                            |
| seller_id (FK)                          |
| price, quantity                         |
+-----------------------------------------+
          | (1:1 per order)     | (1:1 per completed order)
          v                     v
+-------------------+ +-------------------+
|     PAYMENTS      | |      REVIEWS      |
+-------------------+ +-------------------+
| id (PK)           | | id (PK)           |
| order_id (FK, UQ) | | order_id (FK, UQ) |
| transaction_ref   | | buyer_id (FK)     |
| payment_method    | | seller_id (FK)    |
| status            | | rating (1-5)      |
| is_simulated (T)  | | comment           |
+-------------------+ +-------------------+
```

### Table Descriptions
1. **`users`**: Stores student credentials (bcrypt hashed), contact numbers, role (`buyer`, `seller`, `admin`), hall of residence, student ID, and account status (`active`, `deactivated`).
2. **`items`**: Catalog of student products with seller foreign keys, UGX prices, conditions (`New`, `Like New`, `Used`), categories, photograph URLs, and availability flags.
3. **`cart`**: Active persistent shopping carts mapped one-to-one with student accounts.
4. **`cart_items`**: Individual items in each cart with item foreign key, quantity, and unique constraint preventing duplicate rows.
5. **`orders`**: University purchases with generated order references (`ORD-UCU-YYYY-XXXXX`), buyer details, pickup locations, notes, order status, and payment status.
6. **`order_items`**: Line items inside each order capturing the historical purchase price, quantity, seller ID, and item ID.
7. **`payments`**: Audit records of simulated Mobile Money (MTN / Airtel) or Cash transactions with unique simulation references (`MOMO-SIM-XXXXXX`).
8. **`reviews`**: Seller ratings (1 to 5 stars) and feedback comments submitted by buyers after completing orders.

---

## 5. Project Directory Structure

```
unitrade/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database manager (MySQL mysql2 + Embedded fallback)
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & Role-Based Access Control
│   │   │   ├── upload.js             # Multer image upload configuration
│   │   │   └── validate.js           # Request validation & sanitization
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Register, Login, Profile
│   │   │   ├── items.routes.js       # Browse, Search, Category filter, CRUD listings
│   │   │   ├── cart.routes.js        # Cart items, Quantity adjustment, Clear
│   │   │   ├── orders.routes.js      # Checkout, Simulation, Status progression
│   │   │   ├── reviews.routes.js     # Post reviews, Ratings calculation
│   │   │   ├── admin.routes.js       # System metrics, Moderation, Audit reports
│   │   │   └── upload.routes.js      # Photograph upload endpoint
│   │   ├── utils/
│   │   │   ├── seedData.js           # Seed data records
│   │   │   └── helpers.js            # Formatter helpers
│   │   ├── server.js                 # Express server & frontend distribution
│   │   └── init-db.js                # MySQL database CLI import utility
│   ├── data/
│   │   └── unitrade_dev.json         # Persistent database file storage
│   ├── test-suite.js                 # 16-point automated test script
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Brand navigation, Search, Cart badge, Role links
│   │   │   ├── Footer.jsx            # University metadata, Safety guidelines, Contacts
│   │   │   ├── ProductCard.jsx       # Condition badges, UGX price, Quick cart add
│   │   │   ├── RatingStars.jsx       # 1-5 Stars interactive and display component
│   │   │   ├── OrderTimeline.jsx     # Visual 4-stage tracking timeline
│   │   │   ├── Toast.jsx             # Floating notifications
│   │   │   └── ProtectedRoute.jsx    # Role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User state, JWT storage, Demo account shortcuts
│   │   │   └── CartContext.jsx       # Cart state & optimistic updates
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Hero banner, Categories, Featured & Recent items
│   │   │   ├── Products.jsx          # Catalog, Multi-filter sidebar, Price range, Sort
│   │   │   ├── ProductDetails.jsx    # Detailed view, Large photo, Seller card, Reviews
│   │   │   ├── Cart.jsx              # Cart table, Quantities, Order subtotal
│   │   │   ├── Checkout.jsx          # Handover point, Simulated MoMo & Cash checkout
│   │   │   ├── OrderConfirmation.jsx # Success screen, Order reference, Next steps
│   │   │   ├── OrderTracking.jsx     # Visual order timeline, Confirm receipt, Rate seller
│   │   │   ├── Login.jsx             # 1-Click quick login buttons
│   │   │   ├── Register.jsx          # Student registration with role choice
│   │   │   ├── buyer/
│   │   │   │   ├── BuyerDashboard.jsx
│   │   │   │   └── BuyerOrders.jsx
│   │   │   ├── seller/
│   │   │   │   ├── SellerDashboard.jsx
│   │   │   │   ├── SellerProducts.jsx
│   │   │   │   └── SellerOrders.jsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js                # API client with JWT interceptor & UGX formatter
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── dist/                         # Compiled production bundle
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/
│   ├── schema.sql                    # Clean MySQL schema script
│   ├── seed.sql                      # Demonstration sample data script
│   └── unitrade_full.sql             # Combined 1-click import script
├── uploads/                          # Uploaded product photographs
├── .env.example
├── run-project.bat                   # 1-Click Windows launcher
└── README.md
```

---

## 6. How to Run the Application Locally

### Method A: 1-Click Instant Launcher (Windows)
Double-click `run-project.bat` in the project root directory.  
This automatically starts the server and opens your web browser directly to:
```
http://localhost:5000
```

### Method B: Terminal Launch
1. Open PowerShell or Command Prompt.
2. Navigate to the backend directory:
   ```powershell
   cd "C:\Users\MacBook Air\.gemini\antigravity\scratch\unitrade\backend"
   ```
3. Start the application:
   ```powershell
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

---

## 7. Importing Database into MySQL Server (Optional)

If you have MySQL / XAMPP / WAMP installed:
1. Start your MySQL daemon (Port `3306`).
2. Open **phpMyAdmin** or MySQL command line client.
3. Import the unified database script located at:
   ```
   database/unitrade_full.sql
   ```
4. Verify your `.env` configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=unitrade_db
   ```
5. When `npm start` runs, it will detect MySQL and connect via `mysql2`. If MySQL is offline, it automatically continues running via the persistent campus engine.

---

## 8. Automated Testing & Verification Suite

A 16-point automated verification suite tests all core functionalities specified in Section 15 of the academic rubric.

### Running the Test Suite
From the `backend/` directory, execute:
```powershell
node test-suite.js
```

### Test Suite Execution Output
```
================================================================
 STARTING UNITRADE COMPREHENSIVE AUTOMATED TEST SUITE
 Uganda Christian University (UCU) - Course MGT3151
================================================================

✓ TEST 0: Health Check & System Info Passed
✓ TEST 1: User Registration Passed (Student account created with bcrypt password)
✓ TEST 2: User Login & JWT Session Management Passed (Buyer, Seller & Admin verified)
✓ TEST 3: Role-based Access Control (RBAC) Passed (Admins authorized, Buyers denied admin routes)
✓ TEST 4: Product Creation Passed (Item listed with ID 19)
✓ TEST 5: Product Information Update Passed (Title & UGX price updated)
✓ TEST 6: Product Search Passed (1 items found for keyword "Financial")
✓ TEST 7: Product Filtering Passed (5 matching textbooks within budget)
✓ TEST 8: Add to Shopping Cart Passed
✓ TEST 9: View Cart Passed (Item present with subtotal 32000 UGX)
✓ TEST 10: Checkout Passed (Order created: ORD-UCU-2026-64575)
✓ TEST 11: Mock Payment Gateway Simulation Passed (Ref: MOMO-SIM-341887)
✓ TEST 12: Order Data & Relational Items Verification Passed
✓ TEST 13: Order Status Progression Passed (Pending -> Paid -> Ready for Pickup -> Completed)
✓ TEST 14: Buyer Order Tracking Passed (Status confirmed Completed)
✓ TEST 15: Seller Rating & Customer Feedback Passed (5-Star rating recorded)
✓ TEST 16: Administrator Management Functions Passed (Users, Listings & Sales Reports verified)

================================================================
 TEST RESULTS: 16 / 16 TESTS PASSED (100% SUCCESS)
================================================================
```

---

## 9. API Reference Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, database driver, university metadata |
| `POST` | `/api/auth/register` | Public | Register new student buyer or seller |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Get currently authenticated student profile |
| `GET` | `/api/items` | Public | Browse, search, filter (category, price, condition) |
| `GET` | `/api/items/:id` | Public | Detailed product view with seller statistics |
| `GET` | `/api/items/seller/my-items`| Seller | Retrieve listings created by logged-in seller |
| `POST` | `/api/items` | Seller | Add new product with photo upload |
| `PUT` | `/api/items/:id` | Seller/Admin | Edit existing listing details |
| `PATCH`| `/api/items/:id/toggle-status` | Seller/Admin | Toggle available vs sold |
| `DELETE`| `/api/items/:id` | Seller/Admin | Delete product listing |
| `GET` | `/api/cart` | Authenticated | Retrieve active shopping cart items |
| `POST` | `/api/cart/items` | Authenticated | Add product to shopping cart |
| `PUT` | `/api/cart/items/:id` | Authenticated | Update item quantity |
| `DELETE`| `/api/cart/items/:id`| Authenticated | Remove item from cart |
| `POST` | `/api/orders/checkout` | Buyer | Submit order & execute mock payment gateway |
| `GET` | `/api/orders/buyer/my-orders` | Buyer | List all purchases made by student buyer |
| `GET` | `/api/orders/seller/my-orders`| Seller | List incoming orders containing seller's items |
| `GET` | `/api/orders/:id` | Buyer/Seller/Admin | Order details with visual timeline tracking |
| `PATCH`| `/api/orders/:id/status` | Seller/Admin/Buyer | Progress order status (`Pending` → `Completed`) |
| `POST` | `/api/reviews` | Buyer | Rate seller (1-5 stars) & submit feedback |
| `GET` | `/api/reviews/seller/:id` | Public | Retrieve feedback received by seller |
| `GET` | `/api/admin/stats` | Admin | System statistics & totals |
| `GET` | `/api/admin/users` | Admin | List all registered students & sellers |
| `PATCH`| `/api/admin/users/:id/status`| Admin | Deactivate or restore user account |
| `GET` | `/api/admin/products` | Admin | All campus listings for moderation |
| `PATCH`| `/api/admin/products/:id/moderate` | Admin | Deactivate inappropriate product listing |
| `GET` | `/api/admin/orders` | Admin | Campus order monitoring |
| `GET` | `/api/admin/reviews` | Admin | Review moderation audit |
| `GET` | `/api/admin/reports` | Admin | System activity & valuation reports |

---

## 10. Academic Project Assessment Summary

- **Institution:** Uganda Christian University (UCU)
- **Course:** MGT3151 – E-Business, E-Commerce and E-Governance
- **Option:** Option B – E-Commerce
- **Developer Role:** Senior Full-Stack Developer, UI/UX Designer, Database Architect, Cybersecurity Specialist
- **Deliverable:** Fully functional MVP ready for live grading and demonstration.
