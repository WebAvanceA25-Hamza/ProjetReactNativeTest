import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorage<T>(key: string) {
  const getItem = async (): Promise<T | null> => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erreur lors de la lecture de AsyncStorage:', error);
      return null;
    }
  };

  const setItem = async (value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Erreur lors de l’écriture dans AsyncStorage:', error);
    }
  };

  const removeItem = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la suppression de AsyncStorage:', error);
    }
  };

  return { getItem, setItem, removeItem };
}
