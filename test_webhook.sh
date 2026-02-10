#!/bin/bash
# Test webhook script
# Replace YOUR_PROJECT_NAME with your actual Vercel project name

PROJECT_URL="https://loan-origination-dashboard.vercel.app"
WEBHOOK_URL="${PROJECT_URL}/api/webhook/project-financing"

echo "Testing webhook at: ${WEBHOOK_URL}"
echo ""

curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -v \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'

echo ""
echo ""
echo "Check Vercel logs now for: === WEBHOOK RECEIVED ==="
