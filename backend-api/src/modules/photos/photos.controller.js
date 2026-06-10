import * as photoservice from './photos.service.js';

export const uploadPhoto = async (req , res , next)=>{
    try{
        if(!req.file) throw new Error('No image provided');

        const photo = await photoservice.uploadPhoto(
            {
                file : req.file,
                eventId: req.params.eventId, 
                userId: req.user.id
            });
            res.status(201).json(photo);
            
    } catch (err) {
        next(err);
    }
};
export const getEventPhotos = async(req , res ,next) =>{
    try {
        const photos = await photoservice.getEventPhotos({
            eventId: req.params.eventId, 
            userId : req.user.id,
        });
        res.json(photos);

    }catch(err){
        next(err);
    }
};
export const deletePhoto = async (req, res, next) => {
    try {
        await photoservice.deletePhoto({
            photoId: req.params.photoId,
            userId: req.user.id,
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const getMyPhotos = async (req, res, next) => {
    try {
        const photos = await photoservice.getMyPhotosInEvent({
            eventId: req.params.eventId,
            userId: req.user.id,
        });
        res.json(photos);
    } catch (err) {
        next(err);
    }
};
