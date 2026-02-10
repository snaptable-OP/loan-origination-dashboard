# Webhook Data Format

The webhook endpoint accepts two types of data:

## 1. Project Financing Data (Development Loans)

**Endpoint:** `POST /api/webhook` or `POST /api/webhook/project-financing`

### Expected JSON Structure:

```json
{
  "loan_to_value_ratio": 0.603,
  "loan_to_cost_ratio": 0.692,
  "as_is_valuation_of_project": 1520000,
  "as_if_complete_valuation_of_project": 4869565,
  "drawdown_schedule": [
    {
      "construction_milestone": "Foundations and floor structure",
      "drawdown_sum_for_milestone": 0.1
    },
    {
      "construction_milestone": "All wall framing",
      "drawdown_sum_for_milestone": 0.15
    }
  ],
  "expected_presales": 0,
  "existing_permits_and_approvals": [
    {
      "document_id": "BUN60443614",
      "permit_or_approval_document_name": "Resource Consent"
    },
    {
      "document_id": "ENG60454802",
      "permit_or_approval_document_name": "Engineering Approval"
    }
  ],
  "contractual_term_and_risk_assessment": [
    {
      "risk_assessment": "Uncertainty in final contract price; risk of cost overruns if not fixed-price.",
      "contractual_clause": "Contract Price is subject to Adjustments valued by agreement or by actual and reasonable cost plus margin if not agreed."
    }
  ],
  "contingency_sum": {
    "contingency_sum": 45770,
    "percentage_of_project_cost": 2
  }
}
```

### Field Descriptions:

- **loan_to_value_ratio** (number): Loan-to-value ratio
- **loan_to_cost_ratio** (number): Loan-to-cost ratio
- **as_is_valuation_of_project** (number): Current land value
- **as_if_complete_valuation_of_project** (number): Gross realization value if fully sold
- **drawdown_schedule** (array): Array of drawdown entries
  - **construction_milestone** (string): Description of the milestone
  - **drawdown_sum_for_milestone** (number): Percentage (0-1) of total loan for this milestone
- **expected_presales** (number): Required pre-sales amount
- **existing_permits_and_approvals** (array): Array of permits/approvals
  - **document_id** (string, optional): Document reference ID
  - **permit_or_approval_document_name** (string): Name of the permit/approval
- **contractual_term_and_risk_assessment** (array): Array of terms and risks
  - **risk_assessment** (string): Description of the risk
  - **contractual_clause** (string): The contractual clause text
- **contingency_sum** (object): Contingency information
  - **contingency_sum** (number): Contingency amount
  - **percentage_of_project_cost** (number): Percentage of project cost

## 2. Regular Loan Application Data

**Endpoint:** `POST /api/webhook`

### Expected JSON Structure:

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
  "creditScore": 750
}
```

## Database Structure

### Main Table: `project_financing_data`
Stores the main project financing metrics:
- `loan_to_value_ratio`
- `loan_to_cost_ratio`
- `as_is_valuation_of_project`
- `as_if_complete_valuation_of_project`
- `expected_presales`
- `contingency_sum`
- `contingency_sum_percentage_of_project_cost`

### Related Tables:

1. **`drawdown_schedules`** - One row per drawdown milestone
   - `construction_milestone`
   - `drawdown_sum_for_milestone`
   - `sequence_number`

2. **`permits_and_approvals`** - One row per permit/approval
   - `document_id`
   - `permit_or_approval_document_name`

3. **`contractual_terms_and_risks`** - One row per term/risk
   - `risk_assessment`
   - `contractual_clause`

## Testing the Webhook

### Using curl:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000,
    "as_if_complete_valuation_of_project": 4869565,
    "drawdown_schedule": [
      {
        "construction_milestone": "Foundations and floor structure",
        "drawdown_sum_for_milestone": 0.1
      }
    ],
    "expected_presales": 0,
    "existing_permits_and_approvals": [
      {
        "document_id": "BUN60443614",
        "permit_or_approval_document_name": "Resource Consent"
      }
    ],
    "contractual_term_and_risk_assessment": [
      {
        "risk_assessment": "Uncertainty in final contract price",
        "contractual_clause": "Contract Price is subject to Adjustments"
      }
    ],
    "contingency_sum": {
      "contingency_sum": 45770,
      "percentage_of_project_cost": 2
    }
  }'
```

## Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Project financing data received and saved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "project_financing_data": {
    "id": "uuid-here",
    "loan_application_id": null,
    "loan_to_value_ratio": 0.603,
    ...
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error processing webhook",
  "error": "Error message here"
}
```
