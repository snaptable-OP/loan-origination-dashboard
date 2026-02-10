# Webhook Flow Documentation

## Overview

The webhook receives JSON data from a 3rd party app, sends it to the Snaptable data transformer API, and then saves the processed data to Supabase.

## Flow Diagram

```
3rd Party App
    ↓
Webhook Endpoint (POST /api/webhook)
    ↓
Convert JSON to Text
    ↓
Snaptable Data Transformer API
    ↓
Receive Transformed Data
    ↓
Save to Supabase Database
    ↓
Return Success Response
```

## Webhook URLs

### For 3rd Party App Configuration:

**Main Endpoint (Auto-detects data type):**
```
https://your-domain.com/api/webhook
```

**Project Financing Endpoint (Dedicated):**
```
https://your-domain.com/api/webhook/project-financing
```

## Step-by-Step Process

### 1. Webhook Receives JSON Data
- 3rd party app sends POST request with JSON payload
- Server receives and logs the data

### 2. Data Transformation via Snaptable
- JSON data is converted to text (stringified)
- Sent to Snaptable API: `https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f`
- Uses Bearer token authentication
- Request body: `{ "text": "<stringified JSON>" }`

### 3. Process Transformed Data
- If Snaptable succeeds: Use transformed data
- If Snaptable fails: Fall back to original data
- Data is validated and categorized (project financing vs regular loan)

### 4. Save to Supabase
- Project financing data → Saved to multiple tables:
  - `project_financing_data` (main table)
  - `drawdown_schedules` (one row per milestone)
  - `permits_and_approvals` (one row per permit)
  - `contractual_terms_and_risks` (one row per term/risk)
- Regular loan data → Saved to `loan_applications` table

### 5. Return Response
- Success response with saved data
- Includes flag indicating if Snaptable transformation was used

## Environment Variables

Add these to your `.env` file:

```env
# Snaptable Data Transformer API Configuration
SNAPTABLE_API_URL=https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f
SNAPTABLE_API_TOKEN=st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj
```

## Error Handling

- **Snaptable API Failure**: Logs error but continues with original data
- **Database Errors**: Returns error response with details
- **Validation Errors**: Returns 400 status with missing field information

## Example Request

```bash
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000,
    "drawdown_schedule": [...]
  }'
```

## Example Response

```json
{
  "success": true,
  "message": "Project financing data received, transformed, and saved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "project_financing_data": {
    "id": "uuid-here",
    "loan_to_value_ratio": 0.603,
    ...
  },
  "snaptable_transformed": true
}
```

## Testing Locally

1. Start the server:
   ```bash
   npm run server
   ```

2. Use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   ```

3. Give 3rd party app the ngrok URL:
   ```
   https://abc123.ngrok.io/api/webhook/project-financing
   ```

## Notes

- The webhook automatically detects project financing data vs regular loan data
- Snaptable transformation is optional - if it fails, original data is used
- All data is logged for debugging purposes
- Database operations are transactional where possible
