import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loan, Summary } from '../types';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('credsetu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth APIs
  sendOtp: (phone: string) => {
    return client.post<{ message: string; phone: string; mockOtp: string }>('/auth/send-otp', { phone });
  },

  verifyOtp: (phone: string, otp: string) => {
    return client.post<{ message: string; token: string; user: { id: number; phone: string } }>(
      '/auth/verify-otp',
      { phone, otp }
    );
  },

  // Receipt API - upload image bytes to PostgreSQL BYTEA
  uploadReceipt: async (fileUri: string) => {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'receipt.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : `image/jpeg`;

    // React Native FormData format for file uploads
    formData.append('receipt', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    return client.post<{ id: number; receiptUrl: string; message: string }>('/loans/receipts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Helper to convert relative receipt URL (/api/loans/receipts/1) to full network URL
  getReceiptFullUrl: (receiptUrl?: string | null) => {
    if (!receiptUrl) return undefined;
    if (receiptUrl.startsWith('http')) return receiptUrl;
    return `${API_BASE_URL}${receiptUrl.startsWith('/') ? '' : '/'}${receiptUrl}`;
  },

  // Loan APIs
  getLoans: () => {
    return client.get<Loan[]>('/loans');
  },

  createLoan: (data: { friendName: string; amount: number; dueDate: string; receiptUrl?: string }) => {
    return client.post<Loan>('/loans', data);
  },

  markAsRepaid: (loanId: string) => {
    return client.patch<Loan>(`/loans/${loanId}/repay`);
  },

  getSummary: () => {
    return client.get<Summary>('/loans/summary');
  },
};

export default api;
