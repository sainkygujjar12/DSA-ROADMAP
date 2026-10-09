# 🚀 DSA Roadmap

A comprehensive MERN Stack application designed to help students prepare for coding interviews through structured Data Structures & Algorithms (DSA) roadmaps, company-wise questions, and curated practice sheets. The platform provides an organised learning path to strengthen problem-solving skills and improve interview readiness.

## Architecture diagrams

- [Application flow diagram](docs/FLOW.md): browsing, sign-in, progress saves and owner-only admin access.
- [High-level design (HLD)](docs/HLD.md): frontend, API, MongoDB, external services and deployment responsibilities.
- [Deployment and CI/CD guide](DEPLOYMENT.md): setup, live updates, backups and recovery.

The diagrams use Mermaid and render directly on GitHub.

---

## ✨ Features

- 📚 Structured topic-wise DSA roadmap
- 🏢 Company-wise interview questions
- 📋 Curated practice sheets (Striver SDE Sheet, Blind 75, NeetCode, etc.)
- 🔍 Search and filter questions
- 📊 Dashboard with roadmap statistics
- ⚡ Fast and responsive user interface
- 🎯 Easy navigation between topics and sheets

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## 📁 Project Structure

```
DSA-ROADMAP/
│
├── client/              # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/              # Express Backend
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── seed/
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/sainkygujjar12/DSA-ROADMAP.git
cd DSA-ROADMAP
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your MongoDB connection,
JWT secret, and email settings. The API runs on port **8000**. Copy
`client/.env.example` to `client/.env` if you need Google sign-in configuration.

> **Note:** Environment files are excluded from Git using `.gitignore` for security.

---

## ▶️ Running the Project

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

Open your browser and visit:

```
http://localhost:5174
```

Use this exact address in the IDE preview. Vite uses a fixed port so the preview
does not point at a different server. To use the previous address explicitly,
run `npm run dev -- --port 5173` in `client/`. The development API accepts both
local origins. Google sign-in additionally requires the chosen address in the
Google Cloud client's **Authorized JavaScript origins**.

---

## 📌 Current Functionality

- Topic-wise DSA roadmap
- Company-specific coding questions
- Curated DSA sheets
- REST API integration
- MongoDB database support
- Responsive UI
- Search and filtering
- Dashboard overview
- Email verification, Google sign-in and password recovery
- Personal progress, bookmarks and question notes
- Light/dark themes and reduced-motion settings
- Owner-only admin dashboard

## Deployment and live updates

See [DEPLOYMENT.md](DEPLOYMENT.md) for the free Render + MongoDB Atlas setup,
Brevo HTTPS email, MongoDB backups, and GitHub checks before automatic deployment.
The Render Blueprint is [render.yaml](render.yaml). Only the verified account
`sainkygurjar12@gmail.com` can access `/admin`.

---

## 🚀 Future Enhancements

- Daily Coding Challenges
- Contest Tracker
- Interview Experiences
- Discussion Forum

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Sanky**

- GitHub: https://github.com/sainkygujjar12

---

⭐ If you found this project helpful, consider giving it a **star** on GitHub!
