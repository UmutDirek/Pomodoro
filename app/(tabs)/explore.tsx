import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getAllSessions } from '../../utils/storage';

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Raporlar</Text>
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
          <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
        </View>
      </View>

      {sessions.length > 0 ? (
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
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz kayıtlı bir seans yok.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  statLabel: {
    fontSize: 12,
    color: '#666',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

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
  },

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
  sessionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },

  sessionDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  sessionDetail: {
    fontSize: 14,
    color: '#666',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
});
