# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `loan-origination-dashboard` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the region closest to you
5. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY`)
   - **anon** key (this is your `SUPABASE_ANON_KEY`)

## 3. Set Up Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   PORT=3000
   ```

## 4. Create the Database Table

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. Verify the table was created by going to **Table Editor** → You should see `loan_applications`

## 5. Install Dependencies

```bash
npm install
```

## 6. Start the Server

```bash
npm run server
```

The server will start on `http://localhost:3000` and the webhook endpoint will be available at:
```
http://localhost:3000/api/webhook
```

## Webhook Data Format

The webhook accepts JSON data with the following fields (supports both snake_case and camelCase):

### Required Fields:
- `applicant_name` or `applicantName` or `name` - Applicant's full name
- `email` - Applicant's email address
- `loan_type` or `loanType` - Type of loan: `mortgage`, `personal`, `business`, or `auto`
- `amount` or `loanAmount` - Loan amount (number)

### Optional Fields:
- `phone` or `phoneNumber` - Phone number
- `purpose` or `loanPurpose` - Purpose of the loan
- `employment_status` or `employmentStatus` - `employed`, `self-employed`, `unemployed`, or `retired`
- `annual_income` or `annualIncome` - Annual income (number)
- `credit_score` or `creditScore` - Credit score (300-850)
- `status` - Application status: `pending`, `under_review`, `approved`, or `rejected` (defaults to `pending`)
- `application_id` or `applicationId` - Custom application ID (auto-generated if not provided)

### Example Webhook Payload:

```json
{
  "applicantName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "loanType": "mortgage",
  "amount": 250000,
  "purpose": "Home purchase",
  "employmentStatus": "employed",
  "annualIncome": 75000,
  "creditScore": 750,
  "status": "pending"
}
```

## Testing the Webhook

You can test the webhook using curl:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "loanType": "mortgage",
    "amount": 250000,
    "purpose": "Home purchase",
    "employmentStatus": "employed",
    "annualIncome": 75000,
    "creditScore": 750
  }'
```

## Viewing Data in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select the `loan_applications` table
4. You should see all applications that have been received via webhook
