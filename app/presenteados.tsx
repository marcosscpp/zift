import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { deletePresenteado, getPresenteados, Presenteado } from '../lib/presenteados';

export default function PresenteadosScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Presenteado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPresenteados = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPresenteados();
      setItems(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os presenteados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPresenteados();
    }, [loadPresenteados])
  );

  const handleEdit = (item: Presenteado) => {
    router.push({
      pathname: '/add-person',
      params: {
        editId: item.id,
        editName: item.name,
        editBirthday: item.birthday || '',
        editRelationship: item.relationship || '',
        editPhotoUri: item.photoUri || '',
        editShoeSize: item.shoeSize || '',
        editShirtSize: item.shirtSize || '',
        editPantsSize: item.pantsSize || '',
        editDressSize: item.dressSize || '',
        editRingSize: item.ringSize || '',
        editObservations: item.observations || '',
        editLifestyles: item.lifestyles ? JSON.stringify(item.lifestyles) : '',
      },
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remover', 'Deseja remover este presenteado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const next = await deletePresenteado(id);
          setItems(next);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Pessoas Especiais"
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/calendar');
          }
        }}
        showBack={false}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/add-person')}
            style={styles.addHeaderButton}
          >
            <Ionicons name="add" size={22} color={theme.colors.textMain} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>Sua lista</Text>
          <Text style={styles.summaryValue}>{items.length} presenteados</Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Carregando...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum presenteado</Text>
            <Text style={styles.emptyText}>Cadastre alguém para começar a lista.</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/add-person')}
            >
              <Ionicons name="add-circle" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Adicionar Presenteado</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.photoUri }} style={styles.avatar} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.relationship ? (
                    <Text style={styles.cardMeta}>{item.relationship}</Text>
                  ) : null}
                  <View style={styles.cardDetails}>
                    {item.birthday ? (
                      <View style={styles.cardDetailRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                        <Text style={styles.cardDetailText}>{item.birthday}</Text>
                      </View>
                    ) : null}
                    {item.phone ? (
                      <View style={styles.cardDetailRow}>
                        <Ionicons name="call-outline" size={14} color={theme.colors.textMuted} />
                        <Text style={styles.cardDetailText}>{item.phone}</Text>
                      </View>
                    ) : null}
                    {item.email ? (
                      <View style={styles.cardDetailRow}>
                        <Ionicons name="mail-outline" size={14} color={theme.colors.textMuted} />
                        <Text style={styles.cardDetailText}>{item.email}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <BottomNav active="people" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  content: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  summaryValue: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.backgroundLight,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 6,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetailText: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  cardActions: {
    gap: 12,
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addHeaderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
});


