# Full-Stack Admin Dashboard

A secure, high-performance admin dashboard built with React (Vite), Node.js, Express, and MongoDB.

## Features
- Secure Authentication (JWT & bcrypt)
- Role-Based Access Control (User, Admin, Superadmin)
- User Management (CRUD operations)
- Forgot/Reset Password flows with OTP
- Route-based code splitting for fast load times
- Centralized error handling and Error Boundaries

## Architecture & Tech Stack
- **Frontend:** React 19 (Vite), Tailwind CSS, React Router DOM, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas

## Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the `admin` directory:
```env
VITE_API_URL=http://localhost:8000/api
```

## Running Locally

1. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. Start the frontend:
   ```bash
   cd admin
   npm install
   npm run dev
   ```

## Deployment Instructions

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the project into Vercel, set root directory to `admin`.
3. Add `VITE_API_URL` to your production backend URL.
4. Vercel will automatically detect Vite and use `npm run build`.

### Backend (Render)
The backend includes a `render.yaml` Blueprint.
1. Connect your repository to Render.
2. Ensure the `MONGO_URI` and `JWT_SECRET` environment variables are set.
