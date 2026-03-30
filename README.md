# VendorPro – Vendor Management with Quotation & Invoice Generation

A comprehensive full-stack vendor/supplier management system with complete procurement workflow, quotation comparison, and automated invoicing.

## Live Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vendorpro.com | admin123 |
| Manager | procurement@vendorpro.com | manager123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | In-memory (drop-in for PostgreSQL/MySQL using schema.sql) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | Custom CSS Design System (Dark theme, Syne + Plus Jakarta Sans) |

---

## Project Structure

```
vendor-mgmt/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # In-memory DB with seeded data
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, register, JWT
│   │   │   ├── vendorController.js  # Vendor CRUD + evaluation
│   │   │   ├── quotationController.js # RFQ + quotation + comparison
│   │   │   ├── poController.js      # Purchase orders + approval
│   │   │   ├── invoiceController.js # Invoice + GST/TDS + payments
│   │   │   ├── inventoryController.js # Stock + goods receipt + QC
│   │   │   └── dashboardController.js # Analytics aggregation
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication + RBAC
│   │   ├── routes/
│   │   │   └── index.js            # All API routes
│   │   └── index.js                # Express app entry
│   └── package.json
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   └── Sidebar.jsx
│       ├── hooks/useAuth.js        # Auth context
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx       # KPIs + charts
│       │   ├── Vendors.jsx         # Full vendor management
│       │   ├── RFQs.jsx            # RFQ + quotation comparison
│       │   ├── Quotations.jsx      # Quote submission
│       │   ├── PurchaseOrders.jsx  # PO tracking + approval
│       │   ├── Invoices.jsx        # Invoice + GST + payments
│       │   └── Inventory.jsx       # Stock + goods receipt
│       ├── styles/global.css       # Design system
│       ├── utils/api.js            # Axios API service layer
│       ├── utils/helpers.js        # Formatting utilities
│       └── App.jsx                 # Router + protected routes
├── docs/
│   └── schema.sql                  # Full PostgreSQL/MySQL schema
└── postman/
    └── VendorPro_API.postman_collection.json
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### 1. Clone / Extract the Project
```bash
cd vendor-mgmt
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# API runs at http://localhost:5000
# Health check: http://localhost:5000/health
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
# Frontend runs at http://localhost:3000
```

### 4. Environment Variables (optional)
Create `backend/.env`:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
```

---

## Module Features

### 1. Vendor Management
- **Registration**: Company profile, GST, PAN, bank details
- **Categorization**: raw_material, services, equipment, logistics, IT
- **Approval Workflow**: pending → approved / blacklisted
- **Performance Evaluation**: Quality, Delivery, Response, Compliance scores
- **Blacklist Management**: With documented reason
- **Pre-qualification**: Auto-set based on evaluation score ≥ 70

### 2. Quotation Management (RFQ Lifecycle)
- **RFQ Creation**: Title, specs, budget, deadline, vendor selection
- **Multi-vendor Distribution**: Send to multiple approved vendors
- **Quote Submission**: Itemized pricing with HSN codes and GST rates
- **Side-by-Side Comparison**: Price range analysis, auto-recommendation
- **Negotiation Tracker**: Message threads with proposed prices
- **Accept/Reject Flow**: Accepting one auto-rejects others

### 3. Purchase Order Management
- **PO Generation**: Auto-populated from accepted quotation
- **Approval Workflow**: pending_approval → approved → sent → in_transit → delivered
- **Digital Signature**: Auto-generated on approval with user identity
- **Auto-Invoice**: Invoice created automatically on delivery

### 4. Invoice Generation
- **Automated**: Triggered when PO status → delivered
- **GST Calculation**: CGST (9%) + SGST (9%) or IGST (18%)
- **TDS Deduction**: Section 194C @ 1% on base amount
- **Approval Hierarchy**: draft → approved
- **Payment Scheduling**: Amount, method, date with partial payment support
- **Payment Methods**: Bank transfer (NEFT/RTGS), Cheque, UPI, DD

### 5. Inventory Integration
- **Goods Receipt**: Link to PO, multi-item entry
- **Stock Update**: Auto-updates current stock on receipt
- **Quality Check Workflow**: pending_inspection → approved / rejected
- **Return Management**: Quantity deduction on return processing
- **Reorder Level**: Visual indicator for low stock

---

## API Reference

Base URL: `http://localhost:5000/api`

All endpoints (except auth) require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login and get JWT token |
| POST | /auth/register | Register new user |
| GET | /auth/me | Get current user |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /vendors | List vendors (filters: status, category, search) |
| POST | /vendors | Create vendor |
| GET | /vendors/:id | Get vendor details |
| PUT | /vendors/:id | Update vendor |
| POST | /vendors/:id/approve | Approve vendor |
| POST | /vendors/:id/blacklist | Blacklist vendor |
| POST | /vendors/:id/evaluate | Submit evaluation |
| GET | /vendors/stats | Vendor statistics |

### RFQs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /rfqs | List all RFQs |
| POST | /rfqs | Create RFQ |
| GET | /rfqs/:id | Get RFQ with quotations |
| POST | /rfqs/:id/send | Send to vendors |
| POST | /rfqs/:id/close | Close RFQ |
| GET | /rfqs/:rfqId/compare | Compare quotations |

### Quotations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /quotations | List quotations |
| POST | /quotations | Submit quotation |
| POST | /quotations/:id/accept | Accept quotation |
| POST | /negotiations | Add negotiation message |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /purchase-orders | List POs |
| POST | /purchase-orders | Create PO from quotation |
| POST | /purchase-orders/:id/approve | Approve PO (digitally signs) |
| PATCH | /purchase-orders/:id/status | Update PO status |
| GET | /purchase-orders/stats | PO statistics |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /invoices | List invoices |
| GET | /invoices/:id | Invoice detail with tax breakdown |
| POST | /invoices/:id/approve | Approve invoice |
| POST | /invoices/:id/payment | Schedule payment |
| GET | /invoices/stats | Invoice statistics |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /inventory | List inventory items |
| POST | /inventory/receive | Receive goods (GRN) |
| POST | /inventory/quality-check/:id | Quality check |
| POST | /inventory/return | Process return |
| GET | /inventory/receipts | List goods receipts |

---

## Database Schema

The production-ready SQL schema is in `docs/schema.sql`. It includes:
- 14 normalized tables
- UUID primary keys
- Foreign key constraints with ON DELETE CASCADE
- Status check constraints
- Performance indexes

To switch from in-memory to PostgreSQL, replace `src/config/database.js` with a pg/knex connection and use the ORM queries.

---

## Role-Based Access Control

| Action | Admin | Manager | Viewer |
|--------|-------|---------|--------|
| Approve Vendor | ✅ | ✅ | ❌ |
| Blacklist Vendor | ✅ | ❌ | ❌ |
| Approve PO | ✅ | ✅ | ❌ |
| Approve Invoice | ✅ | ✅ | ❌ |
| View All | ✅ | ✅ | ✅ |

---

## Postman Collection

Import `postman/VendorPro_API.postman_collection.json` into Postman.

**Quick Start:**
1. Run "Login (Admin)" – token is auto-saved to collection variable
2. All subsequent requests use the token automatically

---

## ER Diagram (Key Relationships)

```
users ─────────────────────┐
                           │ created_by / evaluated_by
vendors ──────────────────►│
  │  vendor_evaluations    │
  │  vendor_documents      │
  │                        │
  └──► rfq_vendors ◄── rfqs ◄── users
              │
              └──► quotations ──► quotation_items
                       │          negotiations
                       │
                       └──► purchase_orders
                                 │
                                 ├──► invoices ──► payments
                                 │                 invoice_items
                                 └──► goods_receipts ──► inventory_items
```

---

## Key Design Decisions

1. **In-memory DB**: Zero setup time. All data seeded at startup. Swap for PostgreSQL with provided schema.
2. **Auto-invoice**: Invoices auto-generate when PO status becomes "delivered" — reducing manual steps.
3. **Smart comparison**: Quotation comparison uses weighted scoring (price 40%, vendor rating, delivery speed) for best-value recommendation.
4. **GST compliance**: CGST+SGST for intra-state, IGST placeholder for inter-state. TDS deducted at Section 194C rates.
5. **JWT + RBAC**: Stateless authentication with role-based endpoint protection.


