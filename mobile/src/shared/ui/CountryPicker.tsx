import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, sizes, spacing, typography } from '../theme';
import { countries, findCountry, type Country } from '../data/countries';
import { CheckIcon, ChevronDownIcon, SearchIcon } from './icons';

export interface CountryPickerProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export function CountryPicker({
  label,
  value,
  onChange,
  error,
  containerStyle,
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = findCountry(value);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(term) ||
        country.dialCode.includes(term) ||
        country.code.toLowerCase() === term,
    );
  }, [search]);

  const select = (country: Country) => {
    onChange(country.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Country, ${selected?.name ?? 'none selected'}`}
        style={[styles.field, { borderColor: error ? colors.borderError : colors.border }]}
      >
        {selected ? (
          <>
            <Text style={styles.flag}>{selected.flag}</Text>
            <Text style={styles.value}>{selected.name}</Text>
            <Text style={styles.dial}>{selected.dialCode}</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>Select your country</Text>
        )}
        <ChevronDownIcon />
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <Pressable hitSlop={10} onPress={() => setOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code"
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              cursorColor={colors.primary}
            />
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<Text style={styles.empty}>No countries match your search</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => select(item)}
                accessibilityRole="button"
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.dial}>{item.dialCode}</Text>
                {item.code === value ? <CheckIcon /> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.control,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  flag: { fontSize: 20, marginRight: spacing.md },
  value: { ...typography.input, color: colors.textPrimary, flex: 1 },
  placeholder: { ...typography.input, color: colors.placeholder, flex: 1 },
  dial: { ...typography.input, color: colors.textSecondary, marginRight: spacing.md },
  error: { ...typography.helper, color: colors.error, marginTop: spacing.sm },

  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  modalTitle: { ...typography.title, fontSize: 17, color: colors.textPrimary },
  close: { ...typography.link, color: colors.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.control,
    marginHorizontal: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    ...typography.input,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  rowName: { ...typography.input, color: colors.textPrimary, flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  empty: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
