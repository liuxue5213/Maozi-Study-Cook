import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#f97316',
  primaryLight: '#fff7ed',
  secondary: '#059669',
  background: '#fafafa',
  card: '#ffffff',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const textStyles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  caption: { fontSize: 12, color: colors.muted },
  label: { fontSize: 14, fontWeight: '500', color: colors.text },
});

export const commonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
});
