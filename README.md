# CoopShot

## Team Members
- Sodiq Adebayo
- Muhammad Lawan
- Ridwan Haruna
- Halimah Giwa

---

## 🚀 Live Demo

*   **Live Application:** [https://coopshot.netlify.app](https://coopshot.netlify.app)
*   **Backend API:** [https://coopshot.mujaadevs.cloud](https://coopshot.mujaadevs.cloud)
*   **Recorded Demo:** [Link to your recorded demo explaining how your solution works using Loom].


---

## 🎯 The Problem

> **How might we help people who are excluded from or underserved by formal financial systems participate more meaningfully in the financial ecosystem by building on the trusted financial communities and cooperative societies they already use?**

Nigeria has made significant progress in expanding access to financial services through bank accounts, POS terminals, USSD, mobile banking, and digital payment platforms. However, access alone does not guarantee meaningful financial inclusion.

Millions of people—particularly those participating in informal economies—still rely on traditional cooperative societies, savings groups, and community-based financial structures because these systems are familiar, accessible, and trusted, but these communities often operate in isolation, with limited access to modern financial infrastructure, investment opportunities, and transparent financial records.

## ✨ Our Solution

**CoopShot** is a community-powered financial inclusion platform that connects traditional cooperative societies to modern financial infrastructure while preserving the familiar way people already save, contribute, and participate.

Instead of asking underserved communities to abandon trusted cooperative systems and adopt entirely new banking platforms, CoopShot brings new financial opportunities to the systems they already understand. Members can manage cooperative contributions, build a transparent and portable record of their financial participation (a **Cooperative Financial Passport**), track collective savings, and participate in structured investment opportunities through their cooperative — all while cooperatives gain the infrastructure to manage members, contributions, investments, and financial records, and can connect into the wider **CoopShot Network** of cooperatives.

> **We don't ask people to abandon the financial systems they already trust. We connect those systems to new financial opportunities.**

---

## 🛠️ Tech Stack

*   **Frontend:** Next.js (React) + TypeScript, Tailwind CSS v4
*   **Backend:** Node.js (Express) + Sequelize ORM
*   **Database:** MySQL
*   **Authentication:** Custom JWT Authentication
*   **Deployment:** Netlify (frontend), Hostinger VPS (backend)
*   **AI/APIs:** Paystack (payments)

---

## ⚙️ How to Set Up and Run Locally

This is a monorepo containing a `frontend` (Next.js) and a `backend` (Express) app.

1.  Clone the repository:
    ```bash
    git clone http://github.com/Wema-Hackaholics-Hackathon/wema-hackaholics7-0-hackathon-kano-project-coopshot/
    cd wema-hackaholics7-0-hackathon-kano-project-coopshot
    ```

2.  **Backend setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file (see `.env.example`) with the necessary variables:
    ```
    PORT=5000
    CLIENT_URL=http://localhost:3000

    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_NAME=cooperative_db
    DB_USER=root
    DB_PASSWORD=

    JWT_SECRET=change_this_to_a_long_random_secret
    JWT_EXPIRES_IN=7d

    PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```
    Run the API:
    ```bash
    npm run dev
    ```

3.  **Frontend setup:**
    ```bash
    cd frontend
    npm install
    ```
    Create a `.env.local` file with the backend URL:
    ```
    NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5000
    ```
    Run the development server:
    ```bash
    npm run dev
    ```
    Open the application at [http://localhost:3000](http://localhost:3000).
