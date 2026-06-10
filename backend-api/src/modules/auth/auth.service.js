import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid'; 
import { getDownloadUrl } from '../../utils/r2.utils.js';

export const register =  async(name ,email, password) => {
    const {data : existing} = await supabase.from('users').select('id').eq('email', email).single();
    if(existing) throw new Error('User already exists');
    const id = uuidv4(); // Generate a new UUID


    const hashedPassword = await bycrypt.hash(password, 12);

    const{data :user , error}=await supabase.from('users').insert({id, name, email, password: hashedPassword}).select('*').single();

    if(error) throw error;
    
    
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});
    return {token: token, user: {id: user.id, name: user.name, email: user.email, avatar_url: null}};
};

export const login = async (email, password ) =>{
  
    const {data : user, error} = await supabase.from('users').select('id, name, email, password, avatar_url').eq('email', email).single();
    if(error || !user) throw new Error('Invalid credentials');
    
    const isMatch = await bycrypt.compare(password, user.password);
    if(!isMatch) throw new Error('Invalid credentials');

    let signedAvatarUrl = null;
    if (user.avatar_url) {
        try {
            signedAvatarUrl = await getDownloadUrl(user.avatar_url);
        } catch (err) {
            console.error('Failed to sign avatar URL on login:', err.message);
        }
    }

    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});
    return {token, user: {id: user.id, name: user.name, email: user.email, avatar_url: signedAvatarUrl}};
};