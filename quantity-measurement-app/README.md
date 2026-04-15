# Quantity Measurement App (Frontend)

## Prerequisites

- Node.js 18+
- Backend gateway running on `http://localhost:8080`

## Start

```powershell
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Backend API Base URL

Configured in `.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

## Main API Paths Used

- `POST /auth/register`
- `POST /auth/login`
- `POST /api/v1/quantities/compare`
- `POST /api/v1/quantities/convert`
- `POST /api/v1/quantities/add`
- `POST /api/v1/quantities/subtract`
- `POST /api/v1/quantities/multiply`
- `POST /api/v1/quantities/divide`
