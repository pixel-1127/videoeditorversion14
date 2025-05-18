# Video Editor Application - Local Setup Guide

This guide will walk you through setting up and running the Video Editor application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v14+ recommended)
- **npm** or **yarn** (yarn preferred)
- **Python** (v3.8+ recommended)
- **MongoDB** (v4.4+ recommended)

## Directory Structure

The application has two main components:

```
/
├── backend/         # FastAPI backend
└── frontend/        # React frontend
```

## Step 1: Setting Up the Backend

First, let's set up the backend server:

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   
   Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="test_database"
   ```

5. **Start the backend server**:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

   The backend API will be available at `http://localhost:8001`.

## Step 2: Setting Up the Frontend

Now, let's set up the React frontend:

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_BACKEND_URL="http://localhost:8001"
   ```

4. **Start the frontend development server**:
   ```bash
   yarn start
   # or
   npm start
   ```

   The frontend will be available at `http://localhost:3000`.

## Step 3: Using the Application

Once both servers are running:

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the video editor interface with the following panels:
   - Media Library (right side panel)
   - Timeline (bottom panel)
   - Video Preview (center)

## Common Issues & Troubleshooting

### Backend Issues

1. **MongoDB connection errors**:
   - Make sure MongoDB is running on your machine
   - Verify the connection string in the `.env` file

2. **Port already in use**:
   - If port 8001 is already in use, change it in both the backend start command and the frontend `.env` file

### Frontend Issues

1. **Dependencies installation errors**:
   - Try deleting the `node_modules` folder and running `yarn install` again
   - Make sure you're using a compatible Node.js version

2. **API connection errors**:
   - Check if the backend is running correctly
   - Verify the `REACT_APP_BACKEND_URL` in the frontend `.env` file

3. **Video upload/preview issues**:
   - If videos don't appear after upload, try clearing your browser's local storage
   - Make sure you're using supported video formats (MP4, WebM, etc.)

## Development Tips

1. **Backend API Documentation**:
   - Access the Swagger UI documentation at `http://localhost:8001/docs`
   - You can test API endpoints directly from this interface

2. **Code Structure**:
   - Frontend components are in `/frontend/src/components/`
   - Backend routes are defined in `/backend/server.py`

3. **Data Storage**:
   - The application uses MongoDB for backend data storage
   - User-uploaded videos are stored in browser localStorage as base64-encoded strings
   - Sample videos are loaded from external URLs

## Deployment Considerations

When deploying to production:

1. Configure proper CORS settings in the backend
2. Set up proper database authentication for MongoDB
3. Consider using a CDN or object storage for video files instead of localStorage
4. Build the frontend for production using `yarn build` or `npm run build`

## License

This project is for educational purposes only. Please refer to the repository for licensing information.
