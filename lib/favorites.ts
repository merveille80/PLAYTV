import { supabase } from './supabase';

export async function toggleFavorite(userId: string, channelId: string) {
  try {
    // Check if already favorite
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .single();

    if (data) {
      // Remove
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('channel_id', channelId);
      return false;
    } else {
      // Add
      await supabase
        .from('favorites')
        .insert([{ user_id: userId, channel_id: channelId }]);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('channel_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data.map((f: { channel_id: string }) => f.channel_id);
}
