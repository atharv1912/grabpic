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
    // 1. Fetch event ids this user is a participant of
    const { data: memberEvents, error: memberError } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', userId);

    if (memberError) throw memberError;
    if (!memberEvents || memberEvents.length === 0) return [];

    const eventIds = memberEvents.map(me => me.event_id);

    // 2. Fetch events along with participant and photo counts
    const { data: events, error } = await supabase
        .from('events')
        .select(`
            *,
            event_participants(count),
            photos(count)
        `)
        .in('id', eventIds)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Map to match frontend expectations
    return events.map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        joinCode: e.join_code,
        createdBy: e.created_by,
        createdAt: e.created_at,
        memberCount: e.event_participants?.[0]?.count || 0,
        photoCount: e.photos?.[0]?.count || 0
    }));
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
    .select('*, event_participants(user_id, users(name))')
    .eq('id', eventId)
    .single();

  if (error) throw new Error(error.message);

  // Map participants to just members array of names
  const members = event.event_participants?.map(p => p.users?.name || 'Unknown') || [];

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    joinCode: event.join_code,
    createdBy: event.created_by,
    createdAt: event.created_at,
    members: members
  };
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