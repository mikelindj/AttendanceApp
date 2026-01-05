// Example Worker Logic (Simplified)
export default {
    async fetch(request, env) {
      // 1. Get Access Token from Microsoft
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: env.CLIENT_ID,
          client_secret: env.CLIENT_SECRET, // Stored as a secret in Cloudflare
          scope: 'https://orgxxxx.crm.dynamics.com/.default'
        })
      });
      
      const { access_token } = await tokenResponse.json();
  
      // 2. Proxy the request to Dataverse
      // Use the token to fetch/save data...
      return new Response("Success", { status: 200 });
    }
  }