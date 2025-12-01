import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@focus_tracker_sessions';

export interface Session {
  id: string;
  category: string;
  duration: number;
  distractions: number;
  date: string;
}

export const saveSession = async (session: Omit<Session, 'id'>): Promise<boolean> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const sessions: Session[] = existingData ? JSON.parse(existingData) : [];
    
    const newSession: Session = {
      id: Date.now().toString(),
      ...session,
    };
    
    sessions.push(newSession);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    console.log('Seans kaydedildi:', newSession);
    return true;
  } catch (error) {
    console.error('Veri kaydedilemedi:', error);
    return false;
  }
};

export const getAllSessions = async (): Promise<Session[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const sessions = data ? JSON.parse(data) : [];
    console.log('Toplam seans sayısı:', sessions.length);
    return sessions;
  } catch (error) {
    console.error('Veri okunamadı:', error);
    return [];
  }
};

export const clearAllSessions = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Tüm seanslar silindi');
    return true;
  } catch (error) {
    console.error('Veri silinemedi:', error);
    return false;
  }
};