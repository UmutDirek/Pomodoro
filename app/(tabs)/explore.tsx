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
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Raporlar</Text>
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
