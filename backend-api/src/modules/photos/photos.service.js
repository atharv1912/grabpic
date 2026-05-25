import {v4 as uuidv4} from 'uuid';
import {supabase} from '../../config/db.js';
import {uploadToR2, deleteFromR2} from '../../utils/r2.utils.js';

export const uploadPhoto = async ({file , eventId, userId}) => {
    const {data : membership }= await supabase
    .from('event_participants')
    .select('userId')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

    if(!membership) throw new Error('Not a member of this event');

    const ext = file.originalname.split('.').pop();
    const r2_key = `events/${eventId}/${uuidv4()}.${ext}`;


    await uploadToR2({
        key: r2_key,
        buffer: file.buffer, 
        mimetype: file.mimetype,
    });
    // save metadata

    const{data: photo , error}= await supabase
    .from('photos')
    .insert({
        event_id : eventId, 
        uploader_id :userId,
        re_key,
        filename: file.originalname,
        status: 'processing',
    })
    .select()
    .single();
    if (error) throw new Error(error.message);

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


export const getEventPhotos = async ({eventId, userId})=>{
    const {data : membership }= await supabase
    .from('event_members')
    .select('userId')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

    if(!membership) throw new Error('Not a member of this event');
    const {data , error}= await supabase
    .from('photos')
    .select('id, r2_key, filename, status , uploaded_at, uploader_id')
    .order('upoloaded_at' , {ascending: true});

    if (error) throw new Error(error.message);

    return data;
};


export const deletePhoto = async ({photoId , userId}) =>{
    const {data: photo} = await supabase
    .from('photos')
    .select('uploader_id, r2_key')
    .eq('id',photoId)
    .single();

    if(!photo) throw new Error('photo not found');
    if(photo.uploader_id !== userid) throw new Error('Not Authorized');

    await deleteFromR2(photo.r2_key);

    await supabase.from('photos').delete().eq('id',photoId);
}