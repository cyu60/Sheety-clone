# Sheety Clone Exploration Project

This is an exploration project that aims to replicate [Sheety](https://sheety.co/)'s functionality of transforming Google Sheets into RESTful APIs, while focusing on the challenges of Google service integration and authentication.

## Key Challenges & Learnings

### Google OAuth Integration

The primary challenge lies in the OAuth integration process:

- Obtaining proper verification from Google for production use
- Managing OAuth scopes for Google Sheets API access
- Integrating with existing authentication providers (Clerk in this case)

### Required OAuth Scopes

Different levels of access require different scopes:

```text
https://www.googleapis.com/auth/spreadsheets         # Full access (Sensitive)
https://www.googleapis.com/auth/spreadsheets.readonly # Read-only access (Sensitive)
https://www.googleapis.com/auth/drive.file           # Limited file access (Recommended)
```

**Note:** Using sensitive scopes requires Google verification, which involves a review process and additional security requirements.

## Features

- Transform Google Sheets into REST APIs
- CRUD operations on sheet data
- Authentication via Clerk
- Sheet-to-API endpoint mapping
- Real-time data synchronization

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- MongoDB (for mapping storage)
- Clerk (authentication)
- Google Sheets API
- TailwindCSS

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```env
MONGODB_URI=your_mongodb_uri
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URI=your_redirect_uri
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Usage

Once configured, your Google Sheets can be accessed via REST endpoints:

```bash
# Get sheet data
GET /api/{sheetName}

# Add new row
POST /api/{sheetName}

# Update row
PUT /api/{sheetName}

# Delete row
DELETE /api/{sheetName}
```

## Development Status

This is an exploration project focusing on the integration challenges with Google's services. Key areas still under development:

- Production-ready error handling
- Rate limiting
- Caching layer
- Advanced query parameters
- Batch
