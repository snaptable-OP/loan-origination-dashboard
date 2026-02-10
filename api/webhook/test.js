// Test endpoint to verify webhook is accessible
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    endpoints: {
      main: '/api/webhook',
      project_financing: '/api/webhook/project-financing',
      health: '/api/health'
    }
  });
}
