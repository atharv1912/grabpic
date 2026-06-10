import { supabase } from '../../config/db.js';
import { uploadToR2, getDownloadUrl } from '../../utils/r2.utils.js';
import { v4 as uuidv4 } from 'uuid';

export const getMe = async (req, res, next) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, avatar_url')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let signedAvatarUrl = null;
        if (user.avatar_url) {
            try {
                signedAvatarUrl = await getDownloadUrl(user.avatar_url);
            } catch (urlErr) {
                console.error('Error generating signed URL for avatar:', urlErr.message);
            }
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: signedAvatarUrl
        });
    } catch (err) {
        next(err);
    }
};

export const uploadSelfie = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const ext = req.file.originalname.split('.').pop() || 'jpg';
        const r2Key = `selfies/${userId}/${uuidv4()}.${ext}`;

        // Upload to R2
        await uploadToR2({
            key: r2Key,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
        });

        // Update user record
        const { data: user, error } = await supabase
            .from('users')
            .update({ avatar_url: r2Key })
            .eq('id', userId)
            .select('id, name, email, avatar_url')
            .single();

        if (error) throw error;

        const signedAvatarUrl = await getDownloadUrl(r2Key);

        res.json({
            message: 'Selfie uploaded successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: signedAvatarUrl
            }
        });
    } catch (err) {
        next(err);
    }
};
