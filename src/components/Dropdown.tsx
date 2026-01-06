import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';

interface DropdownProps {
    label: string;
    data: string[];
    selectedValue: string | null;
    onSelect: (value: string) => void;
    onAddNew?: (newValue: string) => Promise<void>;
    placeholder?: string;
    disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
    label,
    data,
    selectedValue,
    onSelect,
    onAddNew,
    placeholder = 'Select option',
    disabled = false
}) => {
    const [visible, setVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredData = data.filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelect = (item: string) => {
        onSelect(item);
        setVisible(false);
        setSearchText('');
    };

    const handleAddNew = async () => {
        if (!searchText.trim()) return;
        if (onAddNew) {
            await onAddNew(searchText.trim());
            onSelect(searchText.trim());
            setVisible(false);
            setSearchText('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.selector, disabled && styles.disabled]}
                onPress={() => !disabled && setVisible(true)}
            >
                <Text style={[styles.selectedText, !selectedValue && styles.placeholder]}>
                    {selectedValue || placeholder}
                </Text>
                <Text style={styles.icon}>▼</Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search or add new ${label.toLowerCase()}...`}
                            value={searchText}
                            onChangeText={setSearchText}
                        />

                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        item === selectedValue && styles.selectedOptionText
                                    ]}>{item}</Text>
                                    {item === selectedValue && <Text style={styles.check}>✓</Text>}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                onAddNew ? (
                                    <TouchableOpacity style={styles.addNew} onPress={handleAddNew}>
                                        <Text style={styles.addNewText}>+ Add "{searchText}"</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.empty}>No options found</Text>
                                )
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, color: colors.textLight, marginBottom: 8, fontWeight: '600' },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.background,
    },
    disabled: { opacity: 0.6, backgroundColor: '#f3f4f6' },
    selectedText: { fontSize: 16, color: colors.text },
    placeholder: { color: colors.textLight },
    icon: { fontSize: 12, color: colors.textLight },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    closeText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    searchInput: {
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    option: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionText: { fontSize: 16, color: colors.text },
    selectedOptionText: { color: colors.primary, fontWeight: 'bold' },
    check: { color: colors.primary, fontSize: 16 },
    addNew: {
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: colors.card,
        borderRadius: 8,
    },
    addNewText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
    empty: { textAlign: 'center', padding: 20, color: colors.textLight },
});
