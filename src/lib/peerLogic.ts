import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { GameState, GamePhase } from './types';
import { GameAction, createInitialState, processAction } from './engine';

const generateRoomId = () => Math.floor(100000 + Math.random() * 900000).toString();

export function useGamePeer() {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [myName, setMyName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  
  const isHost = useRef(false);
  const connRef = useRef<DataConnection | null>(null);

  // Expose dispatch to allow local or remote state updates
  const dispatch = useCallback((action: GameAction) => {
    if (isHost.current) {
      setGameState(prev => {
        if (!prev) return prev;
        const nextState = processAction(prev, action);
        // broadcast to guest
        const conn = connRef.current;
        if (conn && conn.open) {
          conn.send({ type: 'STATE_SYNC', state: nextState });
        }
        return nextState;
      });
    } else {
      // Send action to Host
      const conn = connRef.current;
      if (conn && conn.open) {
        conn.send({ type: 'ACTION', action });
      }
    }
  }, []);

  const initHost = (name: string) => {
    isHost.current = true;
    const newRoomId = generateRoomId();
    const pid = `galaxy-${newRoomId}`;
    setRoomId(newRoomId);
    setMyName(name);

    const newPeer = new Peer(pid);
    
    newPeer.on('open', (id) => {
      setMyId(id);
      setGameState(createInitialState(id, name, newRoomId));
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
      connRef.current = conn;
      conn.on('data', (data: any) => {
        if (data.type === 'ACTION') {
          // Process guest action
          dispatch(data.action);
        }
      });
    });

    setPeer(newPeer);
  };

  const initGuest = (joinRoomId: string, name: string) => {
    isHost.current = false;
    setRoomId(joinRoomId);
    setMyName(name);

    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      setMyId(id);
      setPeer(newPeer);
      const conn = newPeer.connect(`galaxy-${joinRoomId}`);
      conn.on('open', () => {
        setConnection(conn);
        connRef.current = conn;
        // Send join action
        conn.send({ type: 'ACTION', action: { type: 'JOIN_GAME', payload: { id, name } } });
      });
      conn.on('data', (data: any) => {
        if (data.type === 'STATE_SYNC') {
          setGameState(data.state);
        }
      });
    });
  };

  return {
    gameState,
    myId,
    myName,
    roomId,
    isHost: isHost.current,
    initHost,
    initGuest,
    dispatch
  };
}
