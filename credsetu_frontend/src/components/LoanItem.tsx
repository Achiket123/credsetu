import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Modal, TouchableOpacity } from "react-native";
import { Loan } from "../types";
import { isOverdue } from "../utils/calc";
import api from "../utils/api";

type Props = {
  loan: Loan;
  onMarkRepaid: (id: string) => void;
};

function formatCreationDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function LoanItem({ loan, onMarkRepaid }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const overdue = isOverdue(loan);
  const receiptUri = api.getReceiptFullUrl(loan.receiptUrl);
  const createdDate = formatCreationDate(loan.createdAt);

  return (
    <View style={[styles.card, overdue && styles.overdueCard, loan.repaid && styles.repaidCard]}>
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{loan.friendName}</Text>
          {overdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>OVERDUE</Text>
            </View>
          )}
          {loan.repaid && (
            <View style={styles.repaidBadge}>
              <Text style={styles.repaidBadgeText}>REPAID</Text>
            </View>
          )}
        </View>
        <Text style={[styles.amount, overdue && styles.overdueAmountText, loan.repaid && styles.repaidAmountText]}>
          ₹{loan.amount.toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailLabel}>Due Date:</Text>
        <Text style={[styles.detailValue, overdue && styles.overdueDateText]}>{loan.dueDate}</Text>
        {createdDate ? (
          <>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>{createdDate}</Text>
          </>
        ) : null}
      </View>

      {receiptUri ? (
        <View style={styles.receiptContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
            style={styles.imgWrapper}
          >
            <Image
              source={{ uri: receiptUri }}
              style={styles.img}
              resizeMode="cover"
            />
            <View style={styles.zoomIconOverlay}>
              <Text style={styles.zoomIconText}>🔍 Tap to zoom</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loan.repaid && (
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => onMarkRepaid(loan.id)}
        >
          <Text style={styles.btnText}>Mark as Repaid</Text>
        </Pressable>
      )}

      {/* Enlarged Receipt Image Modal */}
      {receiptUri ? (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{loan.friendName}'s Receipt</Text>
                  <Pressable
                    style={styles.closeBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeBtnText}>✕ Close</Text>
                  </Pressable>
                </View>

                <Image
                  source={{ uri: receiptUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterText}>
                    Amount: ₹{loan.amount} | Due: {loan.dueDate}
                  </Text>
                  {createdDate ? (
                    <Text style={styles.modalFooterSub}>
                      Added on: {createdDate}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  overdueCard: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  repaidCard: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 17,
    color: '#0f172a',
  },
  overdueBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  overdueBadgeText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  repaidBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  repaidBadgeText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amount: {
    fontWeight: '800',
    fontSize: 18,
    color: '#0f172a',
  },
  overdueAmountText: {
    color: '#dc2626',
  },
  repaidAmountText: {
    color: '#16a34a',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dotSeparator: {
    color: '#94a3b8',
    fontSize: 14,
    marginHorizontal: 2,
  },
  overdueDateText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  receiptContainer: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  imgWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  img: {
    width: 100,
    height: 100,
  },
  zoomIconOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  zoomIconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  btn: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  modalImage: {
    width: '100%',
    height: 380,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  modalFooter: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  modalFooterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalFooterSub: {
    fontSize: 12,
    color: '#64748b',
  },
});
