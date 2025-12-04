import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState, useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  Alert,
  Modal,
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

  const [initialMinutes, setInitialMinutes] = useState(25);

  // GÜN 4 – SUMMARY STATE
  const [showSummary, setShowSummary] = useState(false);

  interface SessionSummary {
    category: string;
    duration: number;
    distractions: number;
    date: string;
  }

  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // TIMER
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                handleTimerComplete(); // GÜN 4
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

  // APPSTATE (DİKKAT DAĞINIKLIĞI)
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

  // GÜN 4 – TIMER TAMAMLANDI
  const handleTimerComplete = () => {
    setIsRunning(false);

    const totalSeconds = initialMinutes * 60;

    const summary = {
      category: selectedCategory,
      duration: totalSeconds,
      distractions: distractionCount,
      date: new Date().toISOString(),
    };

    setSessionSummary(summary);
    setShowSummary(true);

    Alert.alert('🎉 Tebrikler!', 'Odaklanma seansınız tamamlandı!');
  };

  // BUTONLAR
  const handleStart = () => {
    if (!isRunning && seconds === 0 && minutes === initialMinutes) {
      setInitialMinutes(minutes);
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(0);
    setDistractionCount(0);
  };

  const closeSummary = () => {
    setShowSummary(false);
    handleReset();
  };

  // SÜRE AYARLAMA
  const adjustMinutes = (value: number) => {
    if (!isRunning) {
      const newValue = Math.max(1, Math.min(60, minutes + value));
      setMinutes(newValue);
      setInitialMinutes(newValue);
    }
  };

  const formatTime = (m: number, s: number) =>
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

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
              {isRunning ? 'Odaklanma Devam Ediyor...' : 'Hazır'}
            </Text>
          </View>

          {/* SÜRE AYAR BUTTONLARI */}
          {!isRunning && (
            <View style={styles.adjustContainer}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustMinutes(-5)}>
                <Text style={styles.adjustButtonText}>-5 dk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustMinutes(-1)}>
                <Text style={styles.adjustButtonText}>-1 dk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustMinutes(1)}>
                <Text style={styles.adjustButtonText}>+1 dk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustMinutes(5)}>
                <Text style={styles.adjustButtonText}>+5 dk</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* DİKKAT */}
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

        {/* GÜN 4 – MODAL */}
        <Modal
          visible={showSummary}
          transparent
          animationType="slide"
          onRequestClose={closeSummary}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎯 Seans Özeti</Text>

              {sessionSummary && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Kategori:</Text>
                    <Text style={styles.summaryValue}>{sessionSummary.category}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Süre:</Text>
                    <Text style={styles.summaryValue}>
                      {Math.floor(sessionSummary.duration / 60)} dakika
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dikkat Dağınıklığı:</Text>
                    <Text style={styles.summaryValue}>{sessionSummary.distractions}</Text>
                  </View>

                  <View style={styles.successBadge}>
                    <Text style={styles.successText}>
                      {sessionSummary.distractions === 0
                        ? '✨ Mükemmel Odaklanma!'
                        : '👏 Harika İş Çıkardınız!'}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={closeSummary}>
                <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timer: { fontSize: 64, fontWeight: 'bold', color: '#6366f1' },
  timerLabel: { fontSize: 14, color: '#666', marginTop: 10 },

  adjustContainer: { flexDirection: 'row', marginTop: 25, gap: 10 },
  adjustButton: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  statsContainer: { alignItems: 'center', marginBottom: 30 },
  statBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ef4444',
  },
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

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#6366f1',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  successBadge: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  successText: { fontSize: 16, color: '#16a34a', fontWeight: 'bold' },

  closeButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
});
