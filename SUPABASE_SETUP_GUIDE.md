# Rystien Coins - Supabase Integration Setup Guide

## 📋 Overview
This guide will help you set up the complete Supabase backend for Rystien Coins, including authentication, database, storage, and email automation.

---

## 🚀 STEP 1: Create Supabase Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign Up/Login**: Create account or login
3. **Create New Project**:
   - Click "New Project"
   - Organization: Select or create
   - Project Name: `rystien-coins`
   - Database Password: Create strong password (SAVE THIS!)
   - Region: Choose closest to Nigeria (e.g., Frankfurt, London)
   - Click "Create new project"
4. **Wait**: Project creation takes 2-3 minutes

---

## 🔑 STEP 2: Get API Keys

1. **Go to Project Settings**:
   - Click Settings icon (⚙️) in sidebar
   - Click "API" section

2. **Copy These Values**:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   ```

3. **Update Configuration**:
   - Open `js/supabase-config.js`
   - Replace:
     ```javascript
     const SUPABASE_URL = 'YOUR_SUPABASE_URL';
     const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
     ```
   - With your actual values

---

## 🗄️ STEP 3: Setup Database

1. **Open SQL Editor**:
   - Click "SQL Editor" in sidebar
   - Click "New query"

2. **Run Database Schema**:
   - Copy entire content from `database-schema.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for success message

3. **Verify Tables Created**:
   - Click "Table Editor" in sidebar
   - You should see:
     - profiles
     - loan_applications
     - documents
     - notifications
     - email_logs

---

## 📁 STEP 4: Setup Storage

1. **Create Storage Bucket**:
   - Click "Storage" in sidebar
   - Click "Create a new bucket"
   - Bucket name: `documents`
   - Public bucket: **NO** (keep private)
   - Click "Create bucket"

2. **Setup Storage Policies**:
   - Click on `documents` bucket
   - Click "Policies" tab
   - Click "New Policy"
   
   **Policy 1: Users can upload own documents**
   ```sql
   CREATE POLICY "Users can upload own documents"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 2: Users can view own documents**
   ```sql
   CREATE POLICY "Users can view own documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 3: Admins can view all documents**
   ```sql
   CREATE POLICY "Admins can view all documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'documents' AND
     EXISTS (
       SELECT 1 FROM profiles 
       WHERE user_id = auth.uid() AND role = 'admin'
     )
   );
   ```

---

## 🔐 STEP 5: Configure Authentication

1. **Email Settings**:
   - Go to Authentication → Settings
   - Enable "Email" provider (should be enabled by default)
   - Configure email templates:
     - Confirmation email
     - Password reset email
     - Magic link email

2. **Email Templates** (Optional but recommended):
   - Go to Authentication → Email Templates
   - Customize each template with Rystien Coins branding
   - Use yellow/black color scheme

3. **Site URL Configuration**:
   - Go to Authentication → URL Configuration
   - Site URL: `http://localhost:8080` (for development)
   - For production: `https://yourdomain.com`
   - Redirect URLs: Add your domain

---

## 👤 STEP 6: Create Admin User

1. **Register First User**:
   - Open `register.html` in browser
   - Register with admin email (e.g., admin@rystiencoins.com)
   - Complete registration

2. **Make User Admin**:
   - Go to Supabase SQL Editor
   - Run this query (replace with your email):
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'admin@rystiencoins.com';
   ```

3. **Verify Admin Access**:
   - Logout and login again
   - You should be redirected to admin dashboard

---

## 📧 STEP 7: Setup Email Automation (Optional)

### Option A: Using Supabase Edge Functions

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Create Edge Function**:
   ```bash
   supabase functions new send-email
   ```

4. **Deploy Function**:
   ```bash
   supabase functions deploy send-email
   ```

### Option B: Using External Email Service (Recommended)

**Using SendGrid:**

1. **Sign up**: [https://sendgrid.com](https://sendgrid.com)
2. **Get API Key**: Settings → API Keys
3. **Create Email Templates**:
   - Welcome email
   - Application confirmation
   - Status update emails

**Using Resend (Easier):**

1. **Sign up**: [https://resend.com](https://resend.com)
2. **Get API Key**: Settings → API Keys
3. **Add to your project**:
   ```javascript
   // Add to supabase-config.js
   const RESEND_API_KEY = 'your_resend_api_key';
   
   async function sendEmail(to, subject, html) {
       const response = await fetch('https://api.resend.com/emails', {
           method: 'POST',
           headers: {
               'Authorization': `Bearer ${RESEND_API_KEY}`,
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               from: 'Rystien Coins <noreply@rystiencoins.com>',
               to: [to],
               subject: subject,
               html: html
           })
       });
       return response.json();
   }
   ```

---

## 🧪 STEP 8: Testing

### Test User Registration:
1. Open `register.html`
2. Fill form with test data
3. Submit and check email for verification
4. Verify account

### Test Login:
1. Open `login.html`
2. Login with test credentials
3. Should redirect to dashboard

### Test Loan Application:
1. Login as user
2. Go to "Apply for Loan"
3. Fill multi-step form
4. Upload documents
5. Submit application

### Test Admin Dashboard:
1. Login as admin
2. Should redirect to admin dashboard
3. View all applications
4. Approve/reject applications

---

## 🔧 STEP 9: Update Existing Apply Form

Update `apply.html` to integrate with Supabase:

```javascript
// Add to apply.js
document.getElementById('loanApplicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const user = await auth.getUser();
    if (!user) {
        alert('Please login to apply for a loan');
        window.location.href = 'login.html';
        return;
    }

    const formData = new FormData(this);
    
    // Upload documents
    const idDoc = formData.get('idDocument');
    const bankStatement = formData.get('bankStatement');
    const proofAddress = formData.get('proofOfAddress');
    
    let idDocUrl = '', bankStatementUrl = '', proofAddressUrl = '';
    
    if (idDoc.size > 0) {
        const { data } = await db.uploadDocument(idDoc, `${user.id}/id_${Date.now()}_${idDoc.name}`);
        idDocUrl = data?.path || '';
    }
    
    if (bankStatement.size > 0) {
        const { data } = await db.uploadDocument(bankStatement, `${user.id}/bank_${Date.now()}_${bankStatement.name}`);
        bankStatementUrl = data?.path || '';
    }
    
    if (proofAddress.size > 0) {
        const { data } = await db.uploadDocument(proofAddress, `${user.id}/proof_${Date.now()}_${proofAddress.name}`);
        proofAddressUrl = data?.path || '';
    }

    // Create application
    const applicationData = {
        user_id: user.id,
        loan_type: formData.get('loanType'),
        loan_amount: parseFloat(formData.get('loanAmount')),
        loan_duration: parseInt(formData.get('loanDuration')),
        loan_purpose: formData.get('loanPurpose'),
        employment_status: formData.get('employmentStatus'),
        monthly_income: parseFloat(formData.get('monthlyIncome')),
        id_document_url: idDocUrl,
        bank_statement_url: bankStatementUrl,
        proof_of_address_url: proofAddressUrl,
        status: 'pending'
    };

    const { data, error } = await db.createLoanApplication(applicationData);

    if (error) {
        alert('Error submitting application: ' + error.message);
    } else {
        alert('Application submitted successfully! We will contact you within 24 hours.');
        window.location.href = 'dashboard.html';
    }
});
```

---

## 🌐 STEP 10: Update Navigation

Add login/register links to main navigation in all HTML files:

```html
<!-- Add to navbar in index.html, about.html, etc. -->
<ul class="nav-menu" id="navMenu">
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About Us</a></li>
    <li><a href="services.html">Services</a></li>
    <li><a href="apply.html">Apply for Loan</a></li>
    <li><a href="blog.html">Blog</a></li>
    <li><a href="contact.html">Contact</a></li>
    <li><a href="login.html">Login</a></li>
    <li><a href="register.html" class="btn-primary-nav">Register</a></li>
</ul>

<!-- Or if logged in, show dashboard link -->
<script>
    auth.getUser().then(user => {
        if (user) {
            // Update nav to show dashboard link
            const navMenu = document.getElementById('navMenu');
            const lastLi = navMenu.lastElementChild;
            lastLi.innerHTML = '<a href="dashboard.html" class="btn-primary-nav">Dashboard</a>';
        }
    });
</script>
```

---

## 📊 STEP 11: Environment Variables (Production)

For production deployment:

1. **Create `.env` file**:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   RESEND_API_KEY=your_resend_key
   ```

2. **Update config to use env variables**:
   ```javascript
   const SUPABASE_URL = process.env.SUPABASE_URL || 'fallback_url';
   const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'fallback_key';
   ```

---

## 🚀 STEP 12: Deployment

### Deploy to Netlify:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Supabase integration"
   git remote add origin your_github_repo
   git push -u origin main
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Select your repository
   - Build settings: Leave empty (static site)
   - Environment variables: Add your Supabase keys
   - Click "Deploy"

3. **Update Supabase URLs**:
   - Go to Supabase Authentication settings
   - Update Site URL to your Netlify URL
   - Add Netlify URL to redirect URLs

---

## ✅ CHECKLIST

- [ ] Supabase project created
- [ ] API keys copied and configured
- [ ] Database schema executed
- [ ] Storage bucket created with policies
- [ ] Authentication configured
- [ ] Admin user created
- [ ] Email service setup (optional)
- [ ] All pages tested
- [ ] Navigation updated
- [ ] Production deployment completed

---

## 🆘 Troubleshooting

### Issue: "Invalid API key"
- **Solution**: Double-check API keys in `supabase-config.js`

### Issue: "Row Level Security policy violation"
- **Solution**: Ensure RLS policies are created correctly

### Issue: "Storage upload failed"
- **Solution**: Check storage bucket policies

### Issue: "Email not sending"
- **Solution**: Verify email service configuration

### Issue: "Can't access admin dashboard"
- **Solution**: Run SQL to update user role to 'admin'

---

## 📞 Support

For issues or questions:
- **Email**: info@rystiencoins.com
- **Phone**: 07048404115, 08100071824
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)

---

## 🎉 Congratulations!

Your Rystien Coins platform is now fully integrated with Supabase! Users can:
- ✅ Register and login
- ✅ Apply for loans
- ✅ Track applications
- ✅ Upload documents
- ✅ Receive notifications

Admins can:
- ✅ View all applications
- ✅ Approve/reject loans
- ✅ Manage users
- ✅ Generate reports

**Next Steps**: Set up email automation and payment gateway integration!
