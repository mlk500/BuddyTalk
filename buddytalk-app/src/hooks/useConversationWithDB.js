import { useState, useCallback, useEffect } from 'react';
import {
  saveMessage,
  getMessagesByChat,
  updateChatTitle,
  getMemoriesByProfile,
  saveMemory,
  updateProfileLevel,
} from '../services/database';
import { generateChatTitle, extractMemories, assessEnglishLevel } from '../services/openRouterApi';

/**
 * Enhanced conversation hook with database persistence, memory system, and level assessment
 */
export default function useConversationWithDB(character, profile, chat) {
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [messageCount, setMessageCount] = useState(0);

  // Load existing chat messages and memories on mount
  useEffect(() => {
    const loadData = async () => {
      if (!chat || !profile) return;

      try {
        // Load chat messages
        const chatMessages = await getMessagesByChat(chat.id);
        setMessages(chatMessages);
        setMessageCount(chatMessages.filter((m) => m.role === 'user').length);

        // Load profile memories
        const profileMemories = await getMemoriesByProfile(profile.id);
        setMemories(profileMemories);
      } catch (error) {
        console.error('Error loading conversation data:', error);
      }
    };

    loadData();
  }, [chat, profile]);

  // Add message and save to database
  const addMessage = useCallback(
    async (role, content) => {
      if (!chat) return;

      const newMessage = { role, content };
      setMessages((prev) => [...prev, newMessage]);

      try {
        // Save to database
        await saveMessage(chat.id, role, content);

        // Increment user message count
        if (role === 'user') {
          setMessageCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    },
    [chat]
  );

  // Auto-generate chat title after 3-4 exchanges
  useEffect(() => {
    const generateTitle = async () => {
      if (!chat || chat.title || messageCount < 3) return;

      try {
        const userMessages = messages
          .filter((m) => m.role === 'user')
          .slice(0, 4)
          .map((m) => m.content);

        const title = await generateChatTitle(userMessages);
        await updateChatTitle(chat.id, title);
      } catch (error) {
        console.error('Error generating chat title:', error);
      }
    };

    generateTitle();
  }, [chat, messageCount, messages]);

  // Assess English level after 5+ exchanges
  useEffect(() => {
    const assessLevel = async () => {
      if (!profile || messageCount < 5 || profile.english_level !== 'unknown') return;

      try {
        const userMessages = messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content);

        const level = await assessEnglishLevel(userMessages, profile.age);
        await updateProfileLevel(profile.id, level);
      } catch (error) {
        console.error('Error assessing English level:', error);
      }
    };

    assessLevel();
  }, [profile, messageCount, messages]);

  // Extract memories when conversation ends (this will be called manually)
  const extractAndSaveMemories = useCallback(async () => {
    if (!profile || messages.length === 0) return;

    try {
      const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
      const newMemories = await extractMemories(conversationText, profile.name);

      // Save new memories to database
      for (const fact of newMemories) {
        // Check if memory already exists
        const exists = memories.some((m) => m.fact.toLowerCase() === fact.toLowerCase());
        if (!exists) {
          await saveMemory(profile.id, fact);
        }
      }

      console.log('Extracted and saved memories:', newMemories);
    } catch (error) {
      console.error('Error extracting memories:', error);
    }
  }, [profile, messages, memories]);

  return {
    status,
    setStatus,
    messages,
    memories,
    messageCount,
    addMessage,
    extractAndSaveMemories,
  };
}
