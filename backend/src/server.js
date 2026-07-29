require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const sequelize = require('./config/db');
const { TreasuryBill } = require('./models'); // also registers associations
const { seedSandboxCatalog } = require('./services/treasuryBillService');
const { apiLimiter } = require('./middleware/rateLimiters');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const treasuryRoutes = require('./routes/treasuryRoutes');
const passportRoutes = require('./routes/passportRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const path = require('path');

const app = express();

app.use(helmet());

// Falls back to localhost dev origin rather than allowing all origins if
// CLIENT_URL is missing from .env
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Capture the raw request body so the Paystack webhook can verify its signature
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serves uploaded group avatars and documents
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api', treasuryRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/invites', inviteRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

function warnIfInsecureJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  const isPlaceholder = secret === 'change_this_to_a_long_random_secret';
  if (!secret || isPlaceholder || secret.length < 16) {
    console.warn(
      '\n*** WARNING: JWT_SECRET is missing, too short, or still the .env.example placeholder. ***\n' +
      '*** Anyone who knows this value can forge login tokens. Set a long random JWT_SECRET before going live. ***\n'
    );
  }
}

async function start() {
  try {
    warnIfInsecureJwtSecret();

    await sequelize.authenticate();
    console.log('MySQL connection established.');

    // Creates/updates tables to match the models — fine for dev with XAMPP
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    await seedSandboxCatalog(TreasuryBill);
    console.log('Sandbox treasury bill catalog ready.');

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
