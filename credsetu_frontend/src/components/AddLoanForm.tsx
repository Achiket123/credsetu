import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api from '../utils/api';

type Data = {
  friendName: string;
  amount: number;
  dueDate: string;
  receiptUrl?: string;
};

function formatDateToYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function AddLoanForm({ onAdd }: { onAdd: (d: Data) => Promise<void> | void }) {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [localReceiptUri, setLocalReceiptUri] = useState<string | undefined>();
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function pickReceipt() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setLocalReceiptUri(res.assets[0].uri);
      }
    } catch (e) {
      console.error('Image picker error', e);
    }
  }

  function onDateChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setDueDate(formatDateToYYYYMMDD(date));
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  }

  async function submit() {
    const amt = Number(amount);
    if (friendName.trim().length < 2) return setError('Enter friend name (at least 2 letters)');
    if (!amt || amt <= 0) return setError('Amount must be greater than 0');
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || isNaN(Date.parse(dueDate))) {
      return setError('Please select a valid Due Date (YYYY-MM-DD)');
    }

    try {
      setSubmitting(true);
      setError('');

      let persistentReceiptUrl: string | undefined = undefined;

      // 1. If user selected a receipt image, upload its raw bytes to PostgreSQL BYTEA
      if (localReceiptUri) {
        setUploadingReceipt(true);
        try {
          const uploadRes = await api.uploadReceipt(localReceiptUri);
          persistentReceiptUrl = uploadRes.data.receiptUrl;
        } catch (uploadErr: any) {
          console.error('Receipt upload failed:', uploadErr);
          throw new Error('Failed to upload receipt image. Please try again.');
        } finally {
          setUploadingReceipt(false);
        }
      }

      // 2. Create the loan entry with the persistent database receiptUrl
      await onAdd({
        friendName: friendName.trim(),
        amount: amt,
        dueDate,
        receiptUrl: persistentReceiptUrl,
      });

      setFriendName('');
      setAmount('');
      setDueDate('');
      setLocalReceiptUri(undefined);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit entry');
    } finally {
      setSubmitting(false);
      setUploadingReceipt(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add New Loan Entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Friend name (e.g. Rahul Sharma)"
        placeholderTextColor="#94a3b8"
        value={friendName}
        onChangeText={setFriendName}
        editable={!submitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount in Rs. (e.g. 1500)"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        editable={!submitting}
      />

      {/* Due Date Calendar Picker Field */}
      <Pressable
        style={[styles.datePickerInput, showPicker && styles.datePickerInputActive]}
        onPress={() => setShowPicker(true)}
        disabled={submitting}
      >
        <Text style={dueDate ? styles.dateText : styles.datePlaceholderText}>
          {dueDate ? `📅 Due Date: ${dueDate}` : '📅 Select Due Date (Calendar)'}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date(2020, 0, 1)}
        />
      )}

      <Pressable style={styles.secondaryBtn} onPress={pickReceipt} disabled={submitting}>
        <Text style={styles.secondaryBtnText}>
          {localReceiptUri ? '📷 Change receipt photo' : '📷 Add receipt photo (optional)'}
        </Text>
      </Pressable>

      {localReceiptUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: localReceiptUri }} style={styles.previewImg} />
          <View style={{ gap: 4 }}>
            <Text style={styles.previewLabel}>Receipt attached</Text>
            <Pressable onPress={() => setLocalReceiptUri(undefined)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.btn, submitting && styles.btnDisabled]}
        onPress={submit}
        disabled={submitting}
      >
        {submitting ? (
          <View style={styles.submittingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.btnText}>
              {uploadingReceipt ? 'Saving receipt bytes to database...' : 'Adding Loan Entry...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.btnText}>Add Loan Entry</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 13,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  datePickerInputActive: {
    borderColor: '#0f172a',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  datePlaceholderText: {
    fontSize: 15,
    color: '#94a3b8',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  secondaryBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  removeText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  btn: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
});
