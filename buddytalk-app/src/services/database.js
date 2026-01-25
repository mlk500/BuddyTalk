import { supabase } from '../config/supabase';

// ==================== FAMILIES ====================

/**
 * Create a new family with a unique family code
 * @returns {Object} { family_code, family_id }
 */
export async function createFamily() {
  try {
    // Generate random family code
    const code = generateFamilyCode();

    const { data, error } = await supabase
      .from('families')
      .insert([{ family_code: code }])
      .select()
      .single();

    if (error) throw error;

    return {
      family_code: data.family_code,
      family_id: data.id,
    };
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
}

/**
 * Get family by family code
 * @param {string} code - Family code (e.g., "HAPPY-DOLPHIN-42")
 * @returns {Object|null} Family object or null if not found
 */
export async function getFamilyByCode(code) {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('family_code', code.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting family by code:', error);
    throw error;
  }
}

// ==================== PROFILES ====================

/**
 * Get all profiles for a family
 * @param {string} familyId - Family UUID
 * @returns {Array} Array of profile objects
 */
export async function getProfilesByFamily(familyId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting profiles:', error);
    throw error;
  }
}

/**
 * Create a new profile
 * @param {string} familyId - Family UUID
 * @param {string} name - Child's name
 * @param {number} age - Child's age
 * @param {string} avatarUrl - Avatar URL or emoji
 * @returns {Object} Created profile
 */
export async function createProfile(familyId, name, age, avatarUrl) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        family_id: familyId,
        name: name,
        age: parseInt(age, 10),
        avatar_url: avatarUrl,
        english_level: 'unknown',
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

/**
 * Update profile's English level
 * @param {string} profileId - Profile UUID
 * @param {string} level - "unknown" | "needs_support" | "doing_well"
 */
export async function updateProfileLevel(profileId, level) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ english_level: level })
      .eq('id', profileId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile level:', error);
    throw error;
  }
}

/**
 * Update profile details
 * @param {string} profileId - Profile UUID
 * @param {Object} updates - Fields to update (name, age, avatar_url)
 * @returns {Object} Updated profile
 */
export async function updateProfile(profileId, updates) {
  try {
    // Ensure age is a number if provided
    if (updates.age !== undefined) {
      updates.age = parseInt(updates.age, 10);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Delete a profile
 * @param {string} profileId - Profile UUID
 */
export async function deleteProfile(profileId) {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

// ==================== CHATS ====================

/**
 * Get all chats for a profile
 * @param {string} profileId - Profile UUID
 * @returns {Array} Array of chat objects
 */
export async function getChatsByProfile(profileId) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
}

/**
 * Get chats for a profile with a specific character
 * @param {string} profileId - Profile UUID
 * @param {string} characterId - Character ID (e.g., "elsa")
 * @returns {Array} Array of chat objects
 */
export async function getChatsByProfileAndCharacter(profileId, characterId) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('profile_id', profileId)
      .eq('character_id', characterId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
}

/**
 * Create a new chat
 * @param {string} profileId - Profile UUID
 * @param {string} characterId - Character ID (e.g., "elsa")
 * @returns {Object} Created chat
 */
export async function createChat(profileId, characterId) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([{
        profile_id: profileId,
        character_id: characterId,
        title: null, // Will be auto-generated later
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

/**
 * Update chat title
 * @param {string} chatId - Chat UUID
 * @param {string} title - New chat title
 */
export async function updateChatTitle(chatId, title) {
  try {
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
}

/**
 * Update chat timestamp (when a new message is added)
 * @param {string} chatId - Chat UUID
 */
export async function updateChatTimestamp(chatId) {
  try {
    // Trigger an update to refresh the updated_at timestamp
    const newTimestamp = new Date().toISOString();
    console.log('⏰ Updating chat timestamp to:', newTimestamp);

    const { error } = await supabase
      .from('chats')
      .update({ updated_at: newTimestamp })
      .eq('id', chatId);

    if (error) {
      console.error('❌ Failed to update timestamp:', error);
      throw error;
    }

    console.log('✅ Chat timestamp updated successfully');
  } catch (error) {
    console.error('Error updating chat timestamp:', error);
    // Don't throw - timestamp update is not critical
    console.warn('Failed to update chat timestamp, continuing anyway');
  }
}

/**
 * Delete a chat and all its messages
 * @param {string} chatId - Chat UUID
 */
export async function deleteChat(chatId) {
  try {
    // Messages will be automatically deleted due to CASCADE foreign key
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}

// ==================== MESSAGES ====================

/**
 * Get all messages for a chat
 * @param {string} chatId - Chat UUID
 * @returns {Array} Array of message objects
 */
export async function getMessagesByChat(chatId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Save a new message with retry logic
 * @param {string} chatId - Chat UUID
 * @param {string} role - "user" | "assistant"
 * @param {string} content - Message content
 * @param {number} retryCount - Current retry attempt
 * @returns {Object} Created message
 */
export async function saveMessage(chatId, role, content, retryCount = 0) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        role,
        content,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update chat timestamp
    console.log('📝 Message saved, updating chat timestamp for chat:', chatId);
    await updateChatTimestamp(chatId);

    return data;
  } catch (error) {
    console.error('Error saving message:', error);

    // Retry up to 3 times on network errors
    if (retryCount < 3 && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION'))) {
      console.log(`🔄 Retrying message save (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return saveMessage(chatId, role, content, retryCount + 1);
    }

    throw error;
  }
}

// ==================== MEMORIES ====================

/**
 * Get all memories for a profile
 * @param {string} profileId - Profile UUID
 * @returns {Array} Array of memory objects
 */
export async function getMemoriesByProfile(profileId) {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting memories:', error);
    throw error;
  }
}

/**
 * Save a new memory
 * @param {string} profileId - Profile UUID
 * @param {string} fact - Memory fact
 * @returns {Object} Created memory
 */
export async function saveMemory(profileId, fact) {
  try {
    const { data, error } = await supabase
      .from('memories')
      .insert([{
        profile_id: profileId,
        fact,
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
}

/**
 * Delete a memory
 * @param {string} memoryId - Memory UUID
 */
export async function deleteMemory(memoryId) {
  try {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

// ==================== HELPERS ====================

/**
 * Generate a random family code
 * Format: {ADJECTIVE}-{ANIMAL}-{NUMBER}
 * @returns {string} Family code (e.g., "HAPPY-DOLPHIN-42")
 */
function generateFamilyCode() {
  const adjectives = ['HAPPY', 'SUNNY', 'BRAVE', 'MAGIC', 'SWEET', 'COOL', 'BRIGHT', 'LUCKY'];
  const animals = ['DOLPHIN', 'TIGER', 'PANDA', 'BUNNY', 'DRAGON', 'UNICORN', 'LION', 'KOALA'];
  const number = Math.floor(Math.random() * 99) + 1;

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];

  return `${adjective}-${animal}-${number}`;
}

// ==================== FAMILY CODE STORAGE ====================

/**
 * Store family code in localStorage for device memory
 * @param {string} code - Family code
 */
export function storeFamilyCodeLocally(code) {
  try {
    localStorage.setItem('buddytalk_family_code', code.toUpperCase());
  } catch (error) {
    console.error('Error storing family code:', error);
  }
}

/**
 * Get stored family code from localStorage
 * @returns {string|null} Family code or null
 */
export function getStoredFamilyCode() {
  try {
    return localStorage.getItem('buddytalk_family_code');
  } catch (error) {
    console.error('Error getting stored family code:', error);
    return null;
  }
}

/**
 * Clear stored family code from localStorage
 */
export function clearStoredFamilyCode() {
  try {
    localStorage.removeItem('buddytalk_family_code');
  } catch (error) {
    console.error('Error clearing family code:', error);
  }
}

// ==================== SESSIONS ====================

/**
 * Create a new session (when conversation starts)
 * @param {string} profileId - Profile UUID
 * @param {string} chatId - Chat UUID
 * @returns {Object} Created session with id and started_at
 */
export async function createSession(profileId, chatId) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        profile_id: profileId,
        chat_id: chatId,
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

/**
 * End a session (when conversation ends)
 * @param {string} sessionId - Session UUID
 */
export async function endSession(sessionId) {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

/**
 * Get sessions for a profile since a given date
 * @param {string} profileId - Profile UUID
 * @param {Date} since - Start date
 * @returns {Array} Array of session objects
 */
export async function getSessionsByProfile(profileId, since) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('profile_id', profileId)
      .gte('started_at', since.toISOString())
      .order('started_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw error;
  }
}

// ==================== PRACTICE MOMENTS ====================

/**
 * Save a practice moment (grammar error that was recasted)
 * @param {string} profileId - Profile UUID
 * @param {string} chatId - Chat UUID
 * @param {string} errorType - Error type (PAST_TENSE, PRESENT_TENSE, PLURAL, ARTICLE, OTHER)
 * @param {string} original - What child said
 * @param {string} corrected - Correct form
 * @returns {Object} Created practice moment
 */
export async function savePracticeMoment(profileId, chatId, errorType, original, corrected) {
  try {
    const { data, error } = await supabase
      .from('practice_moments')
      .insert([{
        profile_id: profileId,
        chat_id: chatId,
        error_type: errorType,
        original,
        corrected,
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving practice moment:', error);
    throw error;
  }
}

/**
 * Get practice moments for a profile since a given date
 * @param {string} profileId - Profile UUID
 * @param {Date} since - Start date
 * @returns {Array} Array of practice moment objects
 */
export async function getPracticeMomentsByProfile(profileId, since) {
  try {
    const { data, error } = await supabase
      .from('practice_moments')
      .select('*')
      .eq('profile_id', profileId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting practice moments:', error);
    throw error;
  }
}

// ==================== CONCERNS ====================

/**
 * Save a concern/note for parents
 * @param {string} profileId - Profile UUID
 * @param {string} chatId - Chat UUID
 * @param {string} summary - Brief note for parent
 * @returns {Object} Created concern
 */
export async function saveConcern(profileId, chatId, summary) {
  try {
    const { data, error } = await supabase
      .from('concerns')
      .insert([{
        profile_id: profileId,
        chat_id: chatId,
        summary,
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving concern:', error);
    throw error;
  }
}

/**
 * Get concerns for a profile since a given date
 * @param {string} profileId - Profile UUID
 * @param {Date} since - Start date
 * @returns {Array} Array of concern objects
 */
export async function getConcernsByProfile(profileId, since) {
  try {
    const { data, error } = await supabase
      .from('concerns')
      .select('*')
      .eq('profile_id', profileId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting concerns:', error);
    throw error;
  }
}

// ==================== DASHBOARD AGGREGATIONS ====================

/**
 * Get dashboard data for a specific child
 * @param {string} profileId - Profile UUID
 * @returns {Object} Dashboard data including time spent, chat count, practice breakdown, memories, recent chats, concerns
 */
export async function getChildDashboardData(profileId) {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get sessions this week
    const sessions = await getSessionsByProfile(profileId, oneWeekAgo);

    // Calculate total time spent (in minutes)
    const timeSpentThisWeek = sessions.reduce((sum, session) => {
      if (session.ended_at) {
        const duration = (new Date(session.ended_at) - new Date(session.started_at)) / 60000;
        return sum + duration;
      }
      return sum;
    }, 0);

    // Get chats this week
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('profile_id', profileId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('updated_at', { ascending: false });

    if (chatsError) throw chatsError;

    const chatCountThisWeek = chats?.length || 0;

    // Get recent chats (limit to 10)
    const { data: recentChats, error: recentChatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (recentChatsError) throw recentChatsError;

    // Get practice moments this week
    const practiceMoments = await getPracticeMomentsByProfile(profileId, oneWeekAgo);

    // Group by error type
    const practiceBreakdown = practiceMoments.reduce((acc, moment) => {
      acc[moment.error_type] = (acc[moment.error_type] || 0) + 1;
      return acc;
    }, {});

    // Get all memories
    const memories = await getMemoriesByProfile(profileId);

    // Get concerns this week
    const concerns = await getConcernsByProfile(profileId, oneWeekAgo);

    return {
      timeSpentThisWeek: Math.round(timeSpentThisWeek),
      chatCountThisWeek,
      practiceBreakdown,
      memories: memories.map(m => m.fact),
      recentChats: recentChats || [],
      concerns: concerns || [],
    };
  } catch (error) {
    console.error('Error getting child dashboard data:', error);
    throw error;
  }
}

/**
 * Get family overview data (all children summary)
 * @param {string} familyId - Family UUID
 * @returns {Array} Array of child summaries
 */
export async function getFamilyOverviewData(familyId) {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all profiles for family
    const profiles = await getProfilesByFamily(familyId);

    // Get data for each profile
    const overviewData = await Promise.all(
      profiles.map(async (profile) => {
        // Get sessions this week
        const sessions = await getSessionsByProfile(profile.id, oneWeekAgo);
        const timeSpentThisWeek = sessions.reduce((sum, session) => {
          if (session.ended_at) {
            const duration = (new Date(session.ended_at) - new Date(session.started_at)) / 60000;
            return sum + duration;
          }
          return sum;
        }, 0);

        // Get chats this week
        const { data: chatsThisWeek, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('profile_id', profile.id)
          .gte('created_at', oneWeekAgo.toISOString());

        if (chatsError) throw chatsError;

        const chatCountThisWeek = chatsThisWeek?.length || 0;

        // Get all chats to find favorite character
        const allChats = await getChatsByProfile(profile.id);
        const characterCounts = allChats.reduce((acc, chat) => {
          acc[chat.character_id] = (acc[chat.character_id] || 0) + 1;
          return acc;
        }, {});

        const favoriteCharacter = Object.keys(characterCounts).length > 0
          ? Object.keys(characterCounts).reduce((a, b) =>
              characterCounts[a] > characterCounts[b] ? a : b
            )
          : null;

        // Get last activity
        const lastActivity = allChats.length > 0 ? allChats[0].updated_at : null;

        return {
          profile,
          chatCountThisWeek,
          timeSpentThisWeek: Math.round(timeSpentThisWeek),
          favoriteCharacter,
          lastActivity,
        };
      })
    );

    return overviewData;
  } catch (error) {
    console.error('Error getting family overview data:', error);
    throw error;
  }
}
