import { initAuth0 } from '@auth0/nextjs-auth0';

export const auth0 = initAuth0({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
});
