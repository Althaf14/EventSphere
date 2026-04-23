# Event Sphere

A full-stack web application for managing college events, built with the MERN stack (MongoDB, Express.js, React, Node.js). Event Sphere allows users to view, register for, and manage events, with features for administrators and faculty to create and oversee event details.

## Features

- **User Authentication**: Secure login and registration using JWT and Bcrypt.
- **Event Management**: Create, update, view, and delete events.
- **Registration System**: Users can register for events.
- **Admin Dashboard**: Dedicated area for event administration.
- **AI Integration**: Utilizes Google Generative AI for enhanced features.
- **Responsive Design**: Built with Tailwind CSS for a modern, mobile-friendly interface.

## Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **JSON Web Token (JWT)**
- **Google Generative AI SDK**

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed or a MongoDB Atlas connection string

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Althaf14/CollegeEventManager.git
    cd CollegeEventManager
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory with the following variables:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        # Add other necessary variables (e.g., GEMINI_API_KEY)
        ```
    - Start the server:
        ```bash
        npm start
        # or for development
        npm run dev
        ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
    - Start the development server:
        ```bash
        npm run dev
        ```

## Usage

- Access the frontend at `http://localhost:5173` (default Vite port).
- The backend runs on `http://localhost:5000` (or your configured PORT).

## License

This project is licensed under the ISC License.
