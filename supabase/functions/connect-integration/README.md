# Connect Integration Edge Function

This Edge Function handles the OAuth2 flow for connecting third-party integrations like Google Calendar.

## Features

- Generates OAuth2 authorization URLs for supported integrations
- Currently supports:
  - Google Calendar & Meet integration

## Environment Variables

The following environment variables are required:

- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `GOOGLE_REDIRECT_URI`: OAuth2 redirect URI for Google integration

## Endpoints

### POST /

Generates an OAuth2 authorization URL for the specified integration.

#### Request Body

```json
{
  "appType": "GOOGLE_MEET_AND_CALENDAR",
  "userId": "user-uuid"
}
```

#### Response

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

## Error Handling

The function returns appropriate error responses with descriptive messages for:
- Missing parameters
- Unsupported integration types
- OAuth2 configuration errors