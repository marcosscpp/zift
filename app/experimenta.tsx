import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

export default function ExperimentaScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [zMoedas] = useState(4500);

  const categories = ['todos', 'eletrônicos', 'experiências', 'moda', 'casa'];

  const gifts: Gift[] = [
    {
      id: '1',
      name: 'Smartwatch Premium',
      description: 'Relógio inteligente com monitoramento de saúde',
      price: 1200,
      category: 'eletrônicos',
    },
    {
      id: '2',
      name: 'Jantar Romântico',
      description: 'Experiência gastronômica para 2 pessoas',
      price: 500,
      category: 'experiências',
    },
    {
      id: '3',
      name: 'Bolsa de Designer',
      description: 'Bolsa de couro legítimo, modelo exclusivo',
      price: 800,
      category: 'moda',
    },
    {
      id: '4',
      name: 'Kit de Perfumes',
      description: 'Seleção de 3 fragrâncias importadas',
      price: 450,
      category: 'moda',
    },
    {
      id: '5',
      name: 'Jogo de Panelas',
      description: 'Conjunto completo antiaderente',
      price: 600,
      category: 'casa',
    },
  ];

  const filteredGifts = selectedCategory === 'todos' 
    ? gifts 
    : gifts.filter(g => g.category === selectedCategory);

  const handleBuyGift = (gift: Gift) => {
    // Navega para os detalhes do produto
    router.push({
      pathname: '/product-details',
      params: {
        id: gift.id,
        name: gift.name,
        price: gift.price.toString(),
        category: gift.category
      }
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Loja de Presentes"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/calendar')}
        showBack={true}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <Ionicons name="wallet" size={32} color={theme.colors.primary} />
            <View style={styles.balanceText}>
              <Text style={styles.balanceLabel}>Suas Z-Moedas</Text>
              <Text style={styles.balanceValue}>{zMoedas.toLocaleString('pt-BR')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.giftsContainer}>
          {filteredGifts.map((gift) => (
            <TouchableOpacity
              key={gift.id}
              style={styles.giftCard}
              onPress={() => handleBuyGift(gift)}
              activeOpacity={0.7}
            >
              <View style={styles.giftImagePlaceholder}>
                <Ionicons name="gift" size={48} color={theme.colors.primary} />
              </View>
              
              <View style={styles.giftContent}>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftDescription}>{gift.description}</Text>
                
                <View style={styles.giftFooter}>
                  <View style={styles.priceContainer}>
                    <Ionicons name="wallet-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.giftPrice}>{gift.price} Z-Moedas</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>Comprar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="experimenta" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Espaço para o BottomNav floating
  },
  balanceCard: {
    backgroundColor: theme.colors.surfaceLight,
    margin: 16,
    padding: 20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceText: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '300',
    color: theme.colors.textMain,
  },
  categoriesContainer: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textMain,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  giftsContainer: {
    padding: 16,
    gap: 16,
  },
  giftCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    overflow: 'hidden',
  },
  giftImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftContent: {
    padding: 16,
  },
  giftName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  giftDescription: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    marginBottom: 12,
  },
  giftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  buyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});


