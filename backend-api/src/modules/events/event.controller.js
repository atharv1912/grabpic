import {z} from 'zod';
import * as eventService from './event.service.js';



const createEventSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    
    
});

const joinEventSchema = z.object({
    joinCode: z.string().length(6),
});

export const createEvent = async (req, res, next) => {
    try{
        const {name, description} = createEventSchema.parse(req.body);
        const event = await eventService.createEvent(name, description, req.user.id);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

export const joinEvent = async (req, res, next) => {
    try{
        const {joinCode} = joinEventSchema.parse(req.body);
        const event = await eventService.joinEvent(joinCode, req.user.id);
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const getMyEvents = async (req, res, next) => {
    try{
        const events = await eventService.getMyEvents(req.user.id);
        res.json(events);
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try{
        const eventId = req.params.id;
        const event = await eventService.getEventById({eventId, userId: req.user.id});
        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req, res, next) => {
    try{
        const eventId = req.params.id;
        await eventService.deleteEvent({eventId, userId: req.user.id});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};