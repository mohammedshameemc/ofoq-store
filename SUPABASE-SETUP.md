# Supabase Integration Setup Guide

## 🚀 Quick Start

Your admin panel is now ready to connect with Supabase! Follow these steps:

### 1. Update Environment Variables

Open your `.env` file and replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy "Project URL" and "anon/public key"

### 2. Run Database Setup

1. Open your Supabase project dashboard
2. Go to "SQL Editor"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL

This will create:
- ✅ All necessary tables (products, categories, orders, order_items)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Auto-update triggers
- ✅ Sample data for testing

### 3. Create Admin User

You need to create an admin user with special permissions:

**Option A: Via Supabase Dashboard**
1. Go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Click the user to edit
5. Go to "User Metadata" (raw JSON)
6. Add: `{"role": "admin"}`
7. Save

**Option B: Via SQL (after user signup)**
```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@email.com';
```

### 4. Test the Connection

1. Start your development server: `npm run dev`
2. Navigate to `/admin/login`
3. Login with your admin credentials
4. You should see real data from Supabase!

## 📁 Files Created

### Configuration
- `src/config/supabase.ts` - Supabase client initialization

### Services
- `src/services/supabase/auth.service.ts` - Authentication (login, logout, session)
- `src/services/supabase/product.service.ts` - Product CRUD operations
- `src/services/supabase/category.service.ts` - Category management
- `src/services/supabase/order.service.ts` - Order management
- `src/services/supabase/index.ts` - Service exports

### Database
- `supabase-setup.sql` - Complete database schema and sample data

## 🔄 Update Admin Pages (Optional)

The admin pages still use mock data. To connect them to Supabase:

### Example: Update Login Page

```tsx
import { authService } from 'services/supabase';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await authService.login(email, password);
    // Check if user is admin
    const isAdmin = await authService.checkAdminRole();
    if (isAdmin) {
      navigateTo(URLS.admin.dashboard);
    } else {
      alert('Access denied. Admin role required.');
    }
  } catch (error) {
    alert(error.message);
  }
};
```

### Example: Update Products Page

```tsx
import { productService } from 'services/supabase';

const [products, setProducts] = useState([]);

useEffect(() => {
  const loadProducts = async () => {
    try {
      const { data } = await productService.getProducts({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };
  
  loadProducts();
}, [searchTerm, categoryFilter, statusFilter]);
```

## 🔐 Security Notes

### Row Level Security (RLS)
The database has RLS enabled. Only users with `role: 'admin'` in their metadata can modify data.

### API Keys
- ✅ **Anon key** is safe to use in frontend (public)
- ❌ **Service role key** should NEVER be in frontend code

### Best Practices
- Store credentials in `.env` file (already gitignored)
- Never commit sensitive keys to version control
- Use appropriate RLS policies for production

## 📊 Database Schema

### Tables
- **categories** - Product categories
- **products** - Store products
- **orders** - Customer orders
- **order_items** - Order line items

### Relationships
```
categories (1) ----< (many) products
orders (1) ----< (many) order_items
products (1) ----< (many) order_items
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file has correct values
- Make sure variable names start with `VITE_`
- Restart dev server after changing `.env`

### "Invalid JWT" or Authentication Errors
- Verify user has `role: 'admin'` in metadata
- Check Supabase project URL is correct
- Ensure anon key is valid

### "Failed to fetch" or CORS Errors
- Check Supabase project is active
- Verify URL format: `https://xxx.supabase.co`
- Check RLS policies allow access

### Database Permission Errors
- Ensure SQL script ran successfully
- Check RLS policies are created
- Verify user role in metadata

## 🎯 Next Steps

1. Update admin pages to use Supabase services
2. Add loading states and error handling
3. Implement image uploads with Supabase Storage
4. Add real-time subscriptions for live updates
5. Create admin user management page

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

Need help? Check the Supabase docs or open an issue!
