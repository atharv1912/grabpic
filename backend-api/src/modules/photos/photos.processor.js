import { publishPhotoJob } from "../../utils/queue.utils";
import { supabase } from "../../config/db";

export const processPhoto = async({
    photoId , r2Key , eventId
})=>{
    try {
        await publishPhotoJob({photoId, r2Key, eventId});
    } catch(err){
        await supabase
        .from('photos')
        .update({status: 'failed'})
        .eq('id', photoId);
    
        throw err;
    }

};