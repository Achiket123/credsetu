import { View, Text, StyleSheet } from 'react-native';
import { Summary } from '../types';

export function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Overview Summary</Text>
      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Lent</Text>
          <Text style={styles.statValue}>Rs.{summary.totalLent.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Repaid</Text>
          <Text style={[styles.statValue, styles.repaidValue]}>
            Rs.{summary.totalRepaid.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={[styles.statValue, styles.outstandingValue]}>
            Rs.{summary.outstanding.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.statBox, summary.overdueAmount > 0 && styles.overdueBox]}>
          <Text style={[styles.statLabel, summary.overdueAmount > 0 && styles.overdueLabel]}>
            Overdue
          </Text>
          <Text style={[styles.statValue, styles.overdueValue]}>
            Rs.{summary.overdueAmount.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  overdueBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  repaidValue: {
    color: '#16a34a',
  },
  outstandingValue: {
    color: '#2563eb',
  },
  overdueLabel: {
    color: '#b91c1c',
  },
  overdueValue: {
    color: '#dc2626',
  },
});
