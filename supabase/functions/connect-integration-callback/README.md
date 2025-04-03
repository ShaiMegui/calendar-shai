# Connect Integration Callback Edge Function

This Edge Function handles the OAuth2 callback for third-party integrations.

## Features

- Handles OAuth2 callback for Google Calendar integration
- Exchanges authorization code for access tokens
- Stores integration data in the database
- Redirects back to the frontend with success/error status

## Environment Variables

Required environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `GOOGLE_REDIRECT_URI`: OAuth2 redirect URI

## Flow

1. Receives OAuth2 callback with authorization code
2. Exchanges code for access tokens
3. Stores integration data in the database
4. Redirects back to the frontend application

## Error Handling

Handles various error cases:
- Missing authorization code
- Invalid state parameter
- Token exchange failures
- Database errors

All errors are redirected back to the frontend with an error message.