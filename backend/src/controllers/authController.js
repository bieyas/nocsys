const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const logger = require('../utils/logger');

const SECRET_KEY = process.env.JWT_SECRET || 'noc_secret_key_2025';

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findByUsername(username);
        if (!user) {
            logger.warn(`Login gagal: user tidak ditemukan (${username})`);
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Login gagal: password salah untuk user (${username})`);
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        logger.info(`Login berhasil untuk user (${username})`);
        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server, silakan coba lagi.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await UserModel.findByUsername(req.user.username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        logger.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server, silakan coba lagi.' });
    }
};
