import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Loan, Summary } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { LoanItem } from '../components/LoanItem';
import { AddLoanForm } from '../components/AddLoanForm';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function HomeScreen({ phone, onLogout }: { phone: string; onLogout: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalLent: 0,
    totalRepaid: 0,
    overdueAmount: 0,
    outstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [loansRes, summaryRes] = await Promise.all([
        api.getLoans(),
        api.getSummary(),
      ]);
      setLoans(loansRes.data);
      setSummary(summaryRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('credsetu_token');
    await AsyncStorage.removeItem('credsetu_phone');
    onLogout();
  };

  const addLoan = async (d: Omit<Loan, 'id' | 'repaid' | 'createdAt'>) => {
    try {
      const res = await api.createLoan(d);
      setLoans((prev) => [res.data, ...prev]);
      // Refresh summary
      const summaryRes = await api.getSummary();
      setSummary(summaryRes.data);
    } catch (err: any) {
      console.error('Add loan error:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to add loan');
    }
  };

  const markRepaid = async (id: string) => {
    try {
      const res = await api.markAsRepaid(id);
      setLoans((prev) => prev.map((l) => (l.id === id ? res.data : l)));
      // Refresh summary
      const summaryRes = await api.getSummary();
      setSummary(summaryRes.data);
    } catch (err: any) {
      console.error('Mark repaid error:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to mark as repaid');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loadingText}>Loading your entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={loans}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <LoanItem loan={item} onMarkRepaid={markRepaid} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>MiniLedger</Text>
                <Text style={styles.subUser}>+91 {phone}</Text>
              </View>
              <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>

            <SummaryCard summary={summary} />
            <AddLoanForm onAdd={addLoan} />
            <Text style={styles.title2}>Your Loan Entries</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No loan entries yet.</Text>
            <Text style={styles.emptySubText}>Add one using the form above.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 16, paddingTop: 52, paddingBottom: 32 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  subUser: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  title2: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginVertical: 12 },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  emptySubText: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
});
