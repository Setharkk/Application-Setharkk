import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface Collaborator {
  id: string;
  name: string;
  color?: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
}

interface TextChange {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  author: string;
}

interface CursorPosition {
  line: number;
  column: number;
  userId: string;
}

interface CollaborationHook {
  collaborators: Collaborator[];
  isConnected: boolean;
  emitChange: (change: TextChange) => void;
  emitCursorPosition: (position: CursorPosition) => void;
}

const useCollaboration = (documentId: string): CollaborationHook => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const handleConnect = useCallback((): void => {
    setIsConnected(true);
    console.log('Connected to collaboration server');
  }, []);

  const handleCollaboratorJoined = useCallback((user: Collaborator): void => {
    setCollaborators(prev => [...prev, user]);
  }, []);

  const handleCollaboratorLeft = useCallback((userId: string): void => {
    setCollaborators(prev => prev.filter(c => c.id !== userId));
  }, []);

  const handleCollaboratorsList = useCallback((users: Collaborator[]): void => {
    setCollaborators(users);
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', { 
      query: { documentId }
    });

    newSocket.on('connect', handleConnect);
    newSocket.on('collaborator_joined', handleCollaboratorJoined);
    newSocket.on('collaborator_left', handleCollaboratorLeft);
    newSocket.on('collaborators_list', handleCollaboratorsList);

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [documentId, handleConnect, handleCollaboratorJoined, handleCollaboratorLeft, handleCollaboratorsList]);

  const emitChange = useCallback((change: TextChange): void => {
    if (socket && isConnected) {
      socket.emit('text_change', change);
    }
  }, [socket, isConnected]);

  const emitCursorPosition = useCallback((position: CursorPosition): void => {
    if (socket && isConnected) {
      socket.emit('cursor_move', position);
    }
  }, [socket, isConnected]);

  return {
    collaborators,
    isConnected,
    emitChange,
    emitCursorPosition
  };
};

export default useCollaboration; 