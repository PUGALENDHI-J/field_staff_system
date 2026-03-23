# Field Staff Management System - Deployment Guide

This system consists of three main parts:
1. **Node.js/Express Backend** with MongoDB
2. **React Admin Dashboard** (Frontend)
3. **Flutter Mobile App** (Field Staff)

---

## ☁️ 1. Backend Deployment (Render or Heroku)

### Prerequisites:
- A MongoDB Atlas account (for cloud database)
- A Render.com account

### Steps:
1. Set up a MongoDB cluster on MongoDB Atlas.
2. Get your standard connection string (e.g. `mongodb+srv://<user>:<password>@cluster0...`).
3. Push your backend code to GitHub.
4. Go to **Render Dashboard** → **New Web Service**.
5. Connect your GitHub repository and select the `backend` folder as the Root Directory.
6. Set the Build Command: `npm install`
7. Set the Start Command: `npm start`
8. Add the following **Environment Variables** in Render:
   - `PORT` = `5000`
   - `MONGO_URI` = `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET` = `<A strong random secret string>`
9. Click **Deploy**.

---

## 🌐 2. Frontend Deployment (Vercel or Netlify)

### Vercel Deployment Steps:
1. In your `frontend/src/context/AuthContext.jsx` and `App.jsx`, update the API URLs from `http://localhost:5000/api/v1` to your **Deployed Backend URL** (e.g., `https://my-backend.onrender.com/api/v1`).
2. Push your code to GitHub.
3. Go to Vercel and **Add New Project**.
4. Select your frontend repository.
5. Set the framework preset to **Vite**.
6. Click **Deploy**. Vercel will build and host the React dashboard.

---

## 📱 3. Mobile App Deployment (Android / Play Store)

### Preparing for Release:
1. Open `mobile/lib/services/api_service.dart`.
2. Change the `baseUrl` from `http://10.0.2.2:5000/api/v1` to your **Deployed Backend URL**.
3. In the terminal, navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
4. Build the Android App Bundle (AAB):
   ```bash
   flutter build appbundle
   ```
5. You can find the generated `.aab` file at:
   `build/app/outputs/bundle/release/app-release.aab`
6. Upload this file to the Google Play Console, fill out the store listing details, and publish the app.

---

## 🚀 Local Testing Commands
If you want to run everything locally:
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`
- **Mobile**: `cd mobile && flutter run` (Requires Android Emulator or connected device)
- **Seed Data**: `cd backend && node seed.js` (Creates initial Admin/Staff accounts)
