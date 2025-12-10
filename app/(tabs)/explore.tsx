import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import { BarChart, PieChart } from 'react-native-chart-kit';
import { getAllSessions, clearAllSessions } from '../../utils/storage';

const screenWidth = Dimensions.get('window').width;

interface Session {
  id: string;
  category: string;
  duration: number;
  distractions: number;
  date: string;
}

export default function ReportsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    todayTotal: 0,
    allTimeTotal: 0,
    totalDistractions: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAllSessions();
    setSessions(data);
    calculateStats(data);
  };

  const calculateStats = (data: Session[]) => {
    const today = new Date().toDateString();
    let todayTotal = 0;
    let allTimeTotal = 0;
    let totalDistractions = 0;

    data.forEach((session) => {
      const sessionDate = new Date(session.date).toDateString();

      allTimeTotal += session.duration;
      totalDistractions += session.distractions;

      if (sessionDate === today) {
        todayTotal += session.duration;
      }
    });

    setStats({
      todayTotal: Math.floor(todayTotal / 60),
      allTimeTotal: Math.floor(allTimeTotal / 60),
      totalDistractions,
    });
  };

  const getLast7DaysData = () => {
    interface DayData {
      date: string;
      label: string;
      duration: number;
    }

    const last7Days: DayData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      last7Days.push({
        date: date.toDateString(),
        label: date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
        }),
        duration: 0,
      });
    }

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date).toDateString();
      const dayData = last7Days.find((d) => d.date === sessionDate);
      if (dayData) {
        dayData.duration += session.duration / 60;
      }
    });

    return {
      labels: last7Days.map((d) => d.label),
      datasets: [
        {
          data: last7Days.map((d) => Math.max(Math.floor(d.duration), 0)),
        },
      ],
    };
  };

  const getCategoryData = () => {
    const totals: { [key: string]: number } = {};

    sessions.forEach((session) => {
      if (!totals[session.category]) totals[session.category] = 0;
      totals[session.category] += session.duration;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return Object.keys(totals).map((category, index) => ({
      name: category,
      population: Math.floor(totals[category] / 60),
      color: colors[index % colors.length],
      legendFontColor: '#666',
      legendFontSize: 12,
    }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Tüm odaklanma seansı verileriniz silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllSessions();
            await loadData();
            Alert.alert('Başarılı', 'Tüm veriler silindi.');
          },
        },
      ]
    );
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    propsForLabels: {
      fontSize: 10,
    },
  };

  const categoryChartData = getCategoryData();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistiklerim</Text>

        {sessions.length > 0 && (
          <TouchableOpacity onPress={handleClearData} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Verileri Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayTotal}</Text>
          <Text style={styles.statLabel}>Bugün (dk)</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.allTimeTotal}</Text>
          <Text style={styles.statLabel}>Toplam (dk)</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {stats.totalDistractions}
          </Text>
          <Text style={styles.statLabel}>Dağınıklık</Text>
        </View>
      </View>

      {sessions.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>📊 Son 7 Gün Odaklanma</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={getLast7DaysData()}
                width={Math.max(screenWidth - 40, 350)}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix=" dk"
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            </ScrollView>
          </View>

          {categoryChartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>🎯 Kategorilere Göre Dağılım</Text>

              <PieChart
                data={categoryChartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </View>
          )}

          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionTitle}>📝 Son Seanslar</Text>

            {sessions.slice(-5).reverse().map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionCategory}>{session.category}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionDetail}>
                    ⏱ {Math.floor(session.duration / 60)} dk
                  </Text>
                  <Text style={styles.sessionDetail}>
                    🔴 {session.distractions} dağınıklık
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📱</Text>
          <Text style={styles.emptyText}>Hiç veri yok</Text>
          <Text style={styles.emptySubtext}>
            İlk odaklanma seansınızı tamamlayın ve ilerlemenizi burada görün.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 10,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
  },

  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },

  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  chart: { borderRadius: 8 },

  sessionsContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  sessionCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sessionCategory: { fontSize: 16, fontWeight: '600', color: '#333' },

  sessionDate: { fontSize: 12, color: '#666' },

  sessionDetails: { flexDirection: 'row', gap: 15 },

  sessionDetail: { fontSize: 14, color: '#666' },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },

  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
