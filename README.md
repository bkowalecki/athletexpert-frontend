# AthleteXpert

Welcome to the **AthleteXpert** front End repository! This is the **React/TypeScript-based** frontend for AthleteXpert, a platform dedicated to helping athletes **shop, learn, and become the best versions of themselves** while engaging with a fitness-focused community.

## 🚀 Features
- 🏋️ **Discover** & search for sports gear from multiple retailers
- 🌟 **Save & track** favorite products
- 📖 **Read** sports-related blog posts
- 🔍 **Advanced search** for both products and blogs
- 🏆 **Earn badges** for achievements
- 🔐 **Authentication** with Email/Password & Google (Auth0 SSO)
- 🎯 **Interactive gear quiz** to match users with the best products

---

## 🏁 Getting Started

### ✅ Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 🔧 Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/athletexpert-frontend.git
   cd athletexpert-frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install  # or yarn install
   ```

### 📁 Environment Variables
Create a `.env` file in the root directory and add:
```sh
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_AUTH0_DOMAIN=your-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
```
⚠️ **Do NOT expose private API keys in public repositories.** Ensure `.env` is in `.gitignore`.

### ▶️ Running the App
To start the development server:
```sh
npm start  # or yarn start
```
The app will be available at `http://localhost:3000/`.

---

## 🔐 Authentication
Authentication is handled via **JWT-based Auth0 SSO** and **email/password login**.
- **Email/Password**: Registers/logs in through the backend API.
- **Google SSO**: Auth0 integration enables one-click login.
- **Session Persistence**: Maintained via HttpOnly **JWT cookies**.

---

## 🔗 API Endpoints
The frontend interacts with the backend using REST API endpoints:

### **Products**
- `GET /products` → Fetch all products
- `GET /products/search?query=xyz` → Search for products

### **Blogs**
- `GET /blog/latest` → Fetch latest blog posts

### **User Authentication**
- `POST /users/login` → Log in with email/password
- `POST /users/register` → Register new user
- `GET /users/profile` → Fetch current user profile
- `POST /users/logout` → Log out the user

---

## 📁 Project Structure
```
athletexpert-frontend/
│-- public/            # Static assets
│-- src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-specific pages
│   ├── context/       # Global state management (UserContext)
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # CSS files for styling
│   ├── App.tsx        # Main app component
│   ├── index.tsx      # Entry point
│   └── routes.tsx     # App routing logic
│-- .env               # Environment variables
│-- package.json       # Dependencies and scripts
│-- README.md          # Project documentation
```

---

## 🎨 UI & Styling
- **Dark mode by default**
- **Fully responsive** for mobile & desktop
- **Minimal, clean aesthetic** with smooth UX

---

## 🛠️ Testing
To run tests:
```sh
npm test
```
Currently, testing is minimal, but **Jest & React Testing Library** can be expanded upon.

---

## 🏗️ Future Enhancements
- ✅ **Profile editing & settings page**
- 🛒 **Multi-retailer price comparison**
- 📊 **User stats tracking & leaderboard**
- 📢 **Community & social features**

---

## 🤝 Contributing
Pull requests are welcome! Open an issue first to discuss proposed changes.

---

## 📜 License
**MIT License** © 2025 AthleteXpert


