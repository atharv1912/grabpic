import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/db.js';
import { uploadToR2, deleteFromR2, getDownloadUrl } from '../../utils/r2.utils.js';
import { processPhoto } from '../photos/photos.processor.js';

export const uploadPhoto = async ({ file, eventId, userId }) => {
    console.log('uploadPhoto called with:', { eventId, userId });
    
    const { data: membership, error } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    console.log('Membership query result:', { membership, error });
    
    if (!membership) throw new Error('Not a member of this event');

    const ext = file.originalname.split('.').pop();
    const r2_key = `events/${eventId}/${uuidv4()}.${ext}`;

    await uploadToR2({
        key: r2_key,
        buffer: file.buffer,
        mimetype: file.mimetype,
    });
    // save metadata

    const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({
        event_id: eventId,
        uploader_id: userId,
        r2_key: r2_key,        // ✅ was storage_path
        filename: file.originalname,
        status: 'processing',
        })
        .select()
        .single();
    if (insertError) throw new Error(insertError.message);

    //upload to upstash queue

    processPhoto({
        photoId: photo.id,
        r2Key: r2_key,
        eventId,
    }).catch(err =>
        console.error(`Queue publish failed for photo ${photo.id}:`, err)
    );

    return photo;
};

export const getEventPhotos = async ({ eventId, userId }) => {
    const { data: membership } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (!membership) throw new Error('Not a member of this event');
    const { data, error } = await supabase
        .from('photos')
        .select('id, r2_key, filename, status, uploaded_at, uploader_id, users!uploader_id(name)')
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: true });

    if (error) throw new Error(error.message);

    const photosWithUrls = await Promise.all(data.map(async (p) => {
        let signedUrl = '';
        try {
            signedUrl = await getDownloadUrl(p.r2_key);
        } catch (urlErr) {
            console.error(`Failed to sign URL for ${p.id}:`, urlErr.message);
        }
        return {
            id: p.id,
            url: signedUrl,
            filename: p.filename,
            status: p.status,
            uploadedAt: p.uploaded_at,
            uploadedBy: p.users?.name || 'Unknown',
            uploaderId: p.uploader_id
        };
    }));

    return photosWithUrls;
};

export const getMyPhotosInEvent = async ({ eventId, userId }) => {
    const { data: membership } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (!membership) throw new Error('Not a member of this event');

    const { data: user } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

    if (!user || !user.avatar_url) {
        console.log(`User ${userId} has no selfie configured. Returning empty matching photos.`);
        return [];
    }

    try {
        const workerUrl = 'http://localhost:8000/search-faces';
        console.log(`Calling python worker at ${workerUrl} for user selfie matching...`);
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_id: eventId,
                selfie_storage_path: user.avatar_url,
                threshold: 0.6
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Python worker search-faces failed:', errText);
            return [];
        }

        const searchResult = await response.json();
        console.log(`Worker search results: ${searchResult.matches} match(es) found.`);

        if (!searchResult.photos || searchResult.photos.length === 0) {
            return [];
        }

        const matchedPhotoIds = searchResult.photos.map(p => p.photo_id);

        const { data: photos, error } = await supabase
            .from('photos')
            .select('id, r2_key, filename, status, uploaded_at, uploader_id, users!uploader_id(name)')
            .in('id', matchedPhotoIds)
            .order('uploaded_at', { ascending: true });

        if (error) throw error;

        const matchedPhotosWithUrls = await Promise.all(photos.map(async (p) => {
            let signedUrl = '';
            try {
                signedUrl = await getDownloadUrl(p.r2_key);
            } catch (urlErr) {
                console.error(`Failed to sign URL for ${p.id}:`, urlErr.message);
            }
            return {
                id: p.id,
                url: signedUrl,
                filename: p.filename,
                status: p.status,
                uploadedAt: p.uploaded_at,
                uploadedBy: p.users?.name || 'Unknown',
                uploaderId: p.uploader_id
            };
        }));

        return matchedPhotosWithUrls;
    } catch (workerErr) {
        console.error('Failed to communicate with python worker /search-faces:', workerErr.message);
        return [];
    }
};

export const deletePhoto = async ({ photoId, userId }) => {
    const { data: photo } = await supabase
        .from('photos')
        .select('uploader_id, r2_key')
        .eq('id', photoId)
        .single();

    if (!photo) throw new Error('photo not found');
    if (photo.uploader_id !== userId) throw new Error('Not Authorized');

    await deleteFromR2(photo.r2_key);

    await supabase.from('photos').delete().eq('id', photoId);
};