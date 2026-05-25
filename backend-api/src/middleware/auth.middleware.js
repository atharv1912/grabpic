import { verifyToken } from "../utils/jwt.utils.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = {
        id: decoded.userId   // 👈 NOW AVAILABLE EVERYWHERE
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
