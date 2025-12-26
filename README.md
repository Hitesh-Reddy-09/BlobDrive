# Blob Drive

A modern, fullstack Google Drive-like application for secure, effortless file storage and sharing.

## Features

- User authentication (sign up, sign in)
- Upload, preview, and manage files
- Public and private file sharing with unique links
- Beautiful, animated UI with modern design
- Secure backend with Node.js, Express, and MongoDB
- Azure Blob Storage integration for file storage

## Tech Stack

- **Frontend:** React (Vite), framer-motion, CSS Modules
- **Backend:** Node.js, Express, MongoDB, Azure Blob Storage

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- Azure Blob Storage account (for file storage)

### Setup

#### 1. Clone the repository

```bash
git clone [https://github.com/Hitesh-Reddy-09/BlobDrive.git](https://github.com/Hitesh-Reddy-09/BlobDrive.git)
cd project
```

#### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

#### 3. Configure environment variables

- Copy `.env.example` to `.env` in both `backend/` and `frontend/` (if needed)
- Set your MongoDB URI, JWT secret, Azure credentials, etc.

#### 4. Run the backend

```bash
cd backend
npm start
```

#### 5. Run the frontend

```bash
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

## Usage

- Sign up or sign in to your account
- Upload and manage your files
- Share files via public/private links
- Enjoy a beautiful, animated user experience!

---

**Blob Drive** — Your files, anywhere. Secure. Effortless. Modern.
