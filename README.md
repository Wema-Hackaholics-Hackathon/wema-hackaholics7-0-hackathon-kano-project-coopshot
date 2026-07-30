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

Millions of people—particularly those participating in informal economies—still rely on traditional cooperative societies, savings groups, and community-based financial structures because these systems are familiar, accessible, and trusted.

The challenge is that these communities often operate in isolation, with limited access to modern financial infrastructure, investment opportunities, transparent financial records, and pathways into the formal financial system.

The problem is therefore not simply **access to financial services**.

It is the gap between **the financial systems people already trust** and **the opportunities available within the formal financial ecosystem**.

## ✨ Our Solution

**CoopShot** is a community-powered financial inclusion platform that connects traditional cooperative societies to modern financial infrastructure while preserving the familiar way people already save, contribute, and participate.

Instead of asking underserved communities to abandon trusted cooperative systems and adopt entirely new banking platforms, CoopShot brings new financial opportunities to the systems they already understand.

The platform enables multiple cooperative societies to operate within a connected ecosystem where members can:

- Manage cooperative contributions and financial activity.
- Build a transparent and portable record of their financial participation.
- Monitor collective savings and community wealth.
- Participate in structured investment opportunities through their cooperative.
- Track investment cycles and returns.
- Discover financial opportunities unlocked through consistent participation.

At the cooperative level, CoopShot provides the infrastructure needed to manage members, contributions, investments, and financial records.

At the network level, CoopShot connects multiple cooperatives into a larger community financial ecosystem, creating opportunities for collective financial growth and stronger connections to regulated financial institutions and investment partners.

### Our Core Idea

> **We don't ask people to abandon the financial systems they already trust. We connect those systems to new financial opportunities.**

CoopShot aims to turn existing cooperative participation into a pathway toward greater financial inclusion, financial visibility, and collective wealth creation.

---

## 💡 Key Innovation

### The Cooperative Financial Passport

CoopShot introduces the concept of a **Cooperative Financial Passport**—a structured record of a member's verified financial participation within the cooperative ecosystem.

Instead of relying solely on traditional banking history, the platform recognizes financial behaviors such as:

- Length of cooperative membership.
- Contribution consistency.
- Savings participation.
- Investment participation.
- Loan repayment history.
- Community financial participation.

This creates a clearer picture of an individual's financial journey and can potentially help unlock access to future financial opportunities through appropriate regulated partnerships.

The goal is to ensure that a person's financial history does not remain invisible simply because it was built outside traditional banking channels.

---

## 💰 Community Wealth & Investment

CoopShot enables cooperative societies to participate in structured, low-risk investment opportunities as part of their collective financial strategy.

Our initial concept explores allocating a portion of eligible cooperative assets—such as **5%**—toward short-term Treasury Bill investments through appropriate regulated financial partners.

This model is designed to allow cooperative members to benefit from collective investment opportunities without requiring them to become sophisticated individual investors.

The cooperative remains the trusted community institution, while CoopShot provides the technology and infrastructure to manage and visualize the investment process.

### Example Flow

```
Member Contributions
        ↓
Cooperative Collective Assets
        ↓
Eligible Investment Allocation
        ↓
Treasury Bill Investment
        ↓
Investment Maturity
        ↓
Returns
        ↓
Cooperative & Member Benefits
```

This transforms cooperative societies from purely savings-based communities into potential engines of collective wealth creation.

---

## 🌍 The CoopShot Network

CoopShot is designed to scale beyond individual cooperative societies.

Multiple cooperatives can join the platform and become part of a connected community financial network.

```
Cooperative A ──┐
Cooperative B ──┤
Cooperative C ──┼──> CoopShot Network
Cooperative D ──┤
Cooperative E ──┘
                      ↓
              Shared Infrastructure
                      ↓
          Financial Identity & Visibility
                      ↓
            Investment Opportunities
                      ↓
             Greater Financial Inclusion
```

As the network grows, CoopShot has the potential to connect more members and cooperatives to financial opportunities while preserving the independence and identity of each cooperative society.

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
    NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5000/api
    ```
    Run the development server:
    ```bash
    npm run dev
    ```
    Open the application at [http://localhost:3000](http://localhost:3000).


## 🔮 Future Vision

CoopShot aims to become a financial infrastructure layer connecting community-based financial institutions with the broader formal financial ecosystem.

Future capabilities could include:

- Regulated investment partnerships.
- Access to insurance products.
- Cooperative-backed financial services.
- SME financing opportunities.
- Pension and long-term savings partnerships.
- Financial education.
- Expanded financial identity services.
- Integration with banks and regulated fintech providers.

Our long-term vision is to create a world where **community participation becomes a pathway to financial opportunity**.

> **CoopShot — Connecting trusted communities to a more inclusive financial future.**
