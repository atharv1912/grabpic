import { supabase } from "../../config/db.js";

import { generateJoinCode } from "../../utils/code.utils.js";

export const createEvent  = async (name, description , userId) => {
    const joinCode = generateJoinCode();
    const {data: event , error } = await supabase.from('events').insert({name, description, join_code: joinCode, created_by: userId}).select('*').single();
    if(error) throw error;
    const { error: memberError } = await supabase
  .from('event_participants')
  .insert({ user_id: userId, event_id: event.id });

  if (memberError) console.error('Auto-join failed:', memberError.message);
    return event;
};

export const joinEvent = async (joinCode, userId) => {
    const {data: event, error} = await supabase.from('events').select('id, name, description, join_code').eq('join_code', joinCode).single();
    if(error || !event) throw new Error('Invalid join code');
    const {data: existing} = await supabase.from('event_participants').select('id').eq('event_id', event.id).eq('user_id', userId).single();
    if(existing) {
        console.log('Already joined this event');
        return event;
    }
    await supabase.from('event_participants').insert({event_id: event.id, user_id: userId});
    return event; 
}

export const getMyEvents = async (userId) => {
    const {data: events, error} = await supabase.from('events')
        .select('*, event_participants!inner(user_id)')
        .eq('event_participants.user_id', userId);
    if(error) throw error;
    return events;
};

export const getEventById = async ({ eventId, userId }) => {
  // Verify membership first
  const { data: membership } = await supabase
    .from('event_participants')
    .select('user_id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (!membership) throw new Error('Not a member of this event');

  const { data: event, error } = await supabase
    .from('events')
    .select('*, event_participants(user_id)')
    .eq('id', eventId)
    .single();

  if (error) throw new Error(error.message);

  return event;
};


export const deleteEvent = async ({ eventId, userId }) => {
  // Only creator can delete
  const { data: event } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single();

  if (!event) throw new Error('Event not found');
  if (event.created_by !== userId) throw new Error('Not authorized');

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  return { message: 'Event deleted' };
};