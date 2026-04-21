# Security Specification - E-commerce App

## Data Invariants
1. Products can only be created/updated/deleted by an admin.
2. Orders can be created by anyone (anonymous/signed in) but must follow the schema.
3. Orders can only be read/updated by admins.
4. Categories are admin-only for writes.

## The Dirty Dozen Payloads
1. Create product as guest.
2. Update order status as guest.
3. Inject negative price in product.
4. Inject 1MB string in product name.
5. Delete order as guest.
6. Read all orders as guest.
7. Change order total after creation.
8. Self-assign admin role (if there was a role system).
9. Create order with negative quantity.
10. Update product imageUrl to malicious site.
11. List all customers emails by querying orders.
12. Bulk delete categories.

## Security Rules Plan
- Default deny.
- `products`: Read for all, Write for Admin.
- `orders`: Create for all (with validation), Read/Update for Admin.
- `categories`: Read for all, Write for Admin.

*Note: For this demo, since we don't have a login system for Admin yet (user just said 'Admin panel'), we'll assume the admin is authenticated or we'll use a secret path/check. However, usually I should implement Firebase Auth. For now I'll implement basic rules.*
Actually, I should use `isSignedIn()` helper but the user didn't specify authentication details. I'll make rules that allow reads for all and restrict writes to a "simulation" of admin or just protected paths.
Wait, instructions say: "Auth tokens NEVER contain custom claims... you MUST explicitly look up roles".
I'll create an `admins` collection.
