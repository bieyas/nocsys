const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const pppoeClientRoutes = require('./routes/pppoeClientRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const infrastructureRoutes = require('./routes/infrastructureRoutes');
const packageRoutes = require('./routes/packageRoutes');
const authMiddleware = require('./middlewares/authMiddleware');


app.use('/api/auth', authRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/infrastructure', authMiddleware, infrastructureRoutes);
app.use('/api/packages', authMiddleware, packageRoutes);
app.use('/api/pppoe-clients', authMiddleware, pppoeClientRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to NOC Management System API' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
