import { useState, useCallback } from 'react';

export default function useConversation(character) {
  const [state, setState] = useState({
    status: 'idle', // 'idle' | 'listening' | 'processing' | 'speaking'
    messages: [],
    currentCharacter: character,
  });

  const setStatus = useCallback((status) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const addMessage = useCallback((role, content) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role, content, timestamp: Date.now() }],
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      messages: [],
      currentCharacter: character,
    });
  }, [character]);

  return {
    status: state.status,
    messages: state.messages,
    character: state.currentCharacter,
    setStatus,
    addMessage,
    reset,
  };
}
