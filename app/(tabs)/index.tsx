import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState, useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const CATEGORIES = [
  'Ders Çalışma',
  'Kodlama',
  'Proje',
  'Kitap Okuma',
  'Diğer',
];

export default function TimerScreen() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [distractionCount, setDistractionCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // TIMER MEKANİZMASI
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                setIsRunning(false); // süre bitti
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // APSTATE DİNLEYİCİSİ – **GÜN 2 YENİ EKLENTİ**
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, [isRunning]);

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (
      appState.current === 'active' &&
      nextState.match(/inactive|background/) &&
      isRunning
    ) {
      // Dikkat dağıldı
      setDistractionCount((prev) => prev + 1);
      setIsRunning(false);

      Alert.alert(
        'Dikkat Dağınıklığı!',
        'Uygulamadan ayrıldığınız için sayaç durduruldu.',
        [{ text: 'Tamam' }]
      );
    }

    appState.current = nextState;
  };

  // buton işlemleri
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setDistractionCount(0);
  };

  const formatTime = (m: number, s: number) => {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* KATEGORİ */}
        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Kategori Seçin:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              enabled={!isRunning}
              style={styles.picker}
            >
              {CATEGORIES.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>
        </View>

        {/* TIMER */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Text style={styles.timer}>{formatTime(minutes, seconds)}</Text>
            <Text style={styles.timerLabel}>
              {isRunning ? 'Çalışıyor...' : 'Hazır'}
            </Text>
          </View>
        </View>

        {/* DİKKAT DAĞINIKLIĞI */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{distractionCount}</Text>
            <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
          </View>
        </View>

        {/* BUTONLAR */}
        <View style={styles.buttonContainer}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.buttonText}>▶ Başlat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <Text style={styles.buttonText}>⏸ Duraklat</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.buttonText}>↻ Sıfırla</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  categoryContainer: { marginTop: 10, marginBottom: 30 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { height: 50 },

  timerContainer: { alignItems: 'center', marginVertical: 30 },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timer: { fontSize: 60, fontWeight: 'bold', color: '#6366f1' },
  timerLabel: { fontSize: 14, color: '#666', marginTop: 10 },

  statsContainer: { alignItems: 'center', marginBottom: 30 },
  statBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    elevation: 3,
  },
  statNumber: { fontSize: 36, fontWeight: 'bold', color: '#ef4444' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 5 },

  buttonContainer: { gap: 15 },
  startButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
