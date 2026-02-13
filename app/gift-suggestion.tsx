import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getSuggestions,
  AISuggestion,
  chatWithZiftBrain,
  generateGiftImage,
  ChatMessage,
} from '../lib/ziftBrain';
import { getPresenteados, Presenteado } from '../lib/presenteados';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenMode = 'picker' | 'suggestions' | 'chat';

type DisplayChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  imageLoading?: boolean;
};

export default function GiftSuggestionScreen() {
  const router = useRouter();
  const { person, occasion, budget } = useLocalSearchParams<{
    person?: string;
    occasion?: string;
    budget?: string;
  }>();

  const [mode, setMode] = useState<ScreenMode>('picker');
  const [people, setPeople] = useState<Presenteado[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Presenteado | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [giftImages, setGiftImages] = useState<Record<number, string | null>>({});
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<DisplayChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    const data = await getPresenteados();
    setPeople(data);

    // If person param was passed, auto-select and go to suggestions
    if (person) {
      const found = data.find((p) => p.id === person || p.name === person);
      if (found) {
        setSelectedPerson(found);
        setMode('suggestions');
        loadSuggestionsFor(found);
        return;
      }
    }

    // If only one person, auto-select
    if (data.length === 1) {
      setSelectedPerson(data[0]);
      setMode('suggestions');
      loadSuggestionsFor(data[0]);
    }
  };

  const loadSuggestionsFor = async (p: Presenteado) => {
    setLoading(true);
    setSuggestions([]);
    setActiveTab(0);
    setGiftImages({});
    try {
      const results = await getSuggestions(p, occasion, budget);
      setSuggestions(results);
      // Auto-generate images for all suggestions in background
      results.forEach((s, idx) => {
        generateGiftImage(s.giftName, p)
          .then((url) => setGiftImages((prev) => ({ ...prev, [idx]: url })))
          .catch(() => setGiftImages((prev) => ({ ...prev, [idx]: null })));
      });
    } catch (error) {
      console.log('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPerson = (p: Presenteado) => {
    setSelectedPerson(p);
    setMode('suggestions');
    loadSuggestionsFor(p);
  };

  const handleGenerateImage = async (idx: number) => {
    if (!suggestions[idx] || !selectedPerson) return;
    setGeneratingImage(idx);
    try {
      const url = await generateGiftImage(suggestions[idx].giftName, selectedPerson);
      setGiftImages((prev) => ({ ...prev, [idx]: url }));
    } catch {
      setGiftImages((prev) => ({ ...prev, [idx]: null }));
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleOpenChat = () => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: '0',
          role: 'assistant',
          content: `Ola! Sou o Zift Brain, seu concierge digital de presentes. Estou aqui para ajudar a encontrar o presente perfeito para ${selectedPerson?.name || 'esta pessoa'}. Como posso ajudar?`,
        },
      ]);
    }
    setMode('chat');
  };

  const handleChatImageGen = async (giftName: string) => {
    if (!selectedPerson) return;
    const placeholderId = String(Date.now());
    setChatMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'assistant', content: `Gerando imagem de "${giftName}"...`, imageLoading: true },
    ]);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const url = await generateGiftImage(giftName, selectedPerson);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: giftName, imageUrl: url || undefined, imageLoading: false }
            : m
        )
      );
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: 'Nao foi possivel gerar a imagem.', imageLoading: false }
            : m
        )
      );
    }
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedPerson || chatLoading) return;

    const text = chatInput.trim();
    const userMsg: DisplayChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Check if user is asking to generate an image
    const imageMatch = text.match(/gere?\s*(?:uma?\s*)?imagem\s*(?:de?|do?|da?)?\s*(.+)/i) ||
                        text.match(/imagem\s*(?:de?|do?|da?)?\s*(.+)/i);
    if (imageMatch && imageMatch[1]) {
      const giftName = imageMatch[1].trim();
      handleChatImageGen(giftName);
      return;
    }

    setChatLoading(true);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages: ChatMessage[] = chatMessages
        .filter((m) => m.id !== '0' && !m.imageUrl && !m.imageLoading)
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: text });

      const reply = await chatWithZiftBrain(apiMessages, selectedPerson);
      setChatMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: 'assistant', content: reply },
      ]);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentSuggestion = suggestions[activeTab];

  // ─── Person Picker ────────────────────────────────────
  if (mode === 'picker') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sugestoes Zift Brain</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.pickerContent}>
          <View style={styles.pickerHeader}>
            <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
            <Text style={styles.pickerTitle}>Para quem e o presente?</Text>
            <Text style={styles.pickerSubtitle}>
              Selecione a pessoa para gerar sugestoes personalizadas
            </Text>
          </View>

          {people.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.colors.roseGrey} />
              <Text style={styles.emptyText}>Nenhum presenteado cadastrado</Text>
              <TouchableOpacity
                style={styles.addPersonButton}
                onPress={() => router.push('/add-person')}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.addPersonButtonText}>Cadastrar Presenteado</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickerList}>
              {people.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.pickerCard}
                  onPress={() => handleSelectPerson(p)}
                  activeOpacity={0.7}
                >
                  {p.photoUri ? (
                    <Image source={{ uri: p.photoUri }} style={styles.pickerAvatar} />
                  ) : (
                    <View style={styles.pickerAvatarPlaceholder}>
                      <Ionicons name="person" size={24} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={styles.pickerCardInfo}>
                    <Text style={styles.pickerCardName}>{p.name}</Text>
                    {p.relationship && (
                      <Text style={styles.pickerCardRelation}>{p.relationship}</Text>
                    )}
                    {p.lifestyles && p.lifestyles.length > 0 && (
                      <View style={styles.pickerLifestyles}>
                        {p.lifestyles.slice(0, 3).map((l) => (
                          <View key={l} style={styles.pickerLifestyleTag}>
                            <Text style={styles.pickerLifestyleText}>{l}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.roseGrey} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ─── Chat Mode ────────────────────────────────────────
  if (mode === 'chat') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setMode('suggestions')}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
          </TouchableOpacity>
          <View style={styles.chatHeaderCenter}>
            <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>Zift Brain</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          ref={chatScrollRef}
          style={styles.chatScrollView}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.chatBubble,
                msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.chatAiIcon}>
                  <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
                </View>
              )}
              {msg.imageLoading && (
                <View style={styles.chatImagePlaceholder}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.chatImageLoadingText}>Gerando imagem...</Text>
                </View>
              )}
              {msg.imageUrl && (
                <Image source={{ uri: msg.imageUrl }} style={styles.chatImage} resizeMode="cover" />
              )}
              <Text
                style={[
                  styles.chatBubbleText,
                  msg.role === 'user' ? styles.chatBubbleTextUser : styles.chatBubbleTextAssistant,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}
          {chatLoading && (
            <View style={[styles.chatBubble, styles.chatBubbleAssistant]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}

          {/* Quick actions - Image generation */}
          {suggestions.length > 0 && !chatLoading && (
            <View style={styles.chatQuickActions}>
              <Text style={styles.chatQuickLabel}>Gerar imagens:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chatQuickScroll}>
                {suggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chatQuickButton}
                    onPress={() => handleChatImageGen(s.giftName)}
                  >
                    <Ionicons name="image-outline" size={14} color={theme.colors.primary} />
                    <Text style={styles.chatQuickText} numberOfLines={1}>{s.giftName}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.chatQuickButton}
                  onPress={() => {
                    setChatInput('Gere uma imagem de ');
                  }}
                >
                  <Ionicons name="add-circle-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.chatQuickText}>Outro presente</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View style={[styles.chatInputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
          <TextInput
            style={styles.chatInputField}
            placeholder="Pergunte ao Zift Brain..."
            placeholderTextColor={theme.colors.roseGrey}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.chatSendButton, !chatInput.trim() && styles.chatSendButtonDisabled]}
            onPress={handleSendChat}
            disabled={!chatInput.trim() || chatLoading}
          >
            <Ionicons name="send" size={18} color={chatInput.trim() ? '#fff' : theme.colors.roseGrey} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── Suggestions Mode ─────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (people.length > 1) {
              setMode('picker');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedPerson?.name || '...'}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleOpenChat}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Analisando perfil...</Text>
          <Text style={styles.loadingSubtext}>
            Zift Brain esta buscando o presente ideal
          </Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles-outline" size={48} color={theme.colors.roseGrey} />
          <Text style={styles.emptyText}>Nenhuma sugestao encontrada</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => selectedPerson && loadSuggestionsFor(selectedPerson)}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* AI Context Header */}
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
              <Text style={styles.aiHeaderText}>ZIFT BRAIN SELECTION</Text>
            </View>

            {/* Suggestion Tabs */}
            <View style={styles.tabsContainer}>
              {suggestions.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.tab, activeTab === idx && styles.tabActive]}
                  onPress={() => setActiveTab(idx)}
                >
                  <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
                    #{idx + 1}
                  </Text>
                  <Text style={[styles.tabMatch, activeTab === idx && styles.tabMatchActive]}>
                    {s.matchPercentage}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Main Suggestion Card */}
            {currentSuggestion && (
              <View style={styles.cardContainer}>
                <View style={styles.cardGlow} />
                <View style={styles.card}>
                  {/* Match Badge */}
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.matchBadge}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#1a1a1a" />
                    <Text style={styles.matchText}>
                      {currentSuggestion.matchPercentage}% Match
                    </Text>
                  </LinearGradient>

                  {/* Gift Image or Icon */}
                  <View style={styles.cardContent}>
                    {giftImages[activeTab] ? (
                      <Image
                        source={{ uri: giftImages[activeTab]! }}
                        style={styles.giftImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.giftIconContainer}>
                        {giftImages[activeTab] === undefined ? (
                          <>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <Text style={styles.imageGenLoadingText}>Gerando imagem...</Text>
                          </>
                        ) : (
                          <Ionicons name="gift" size={48} color={theme.colors.primary} />
                        )}
                      </View>
                    )}

                    <Text style={styles.productCategory}>
                      {currentSuggestion.category}
                    </Text>
                    <Text style={styles.productName}>
                      {currentSuggestion.giftName}
                    </Text>

                    <View style={styles.priceTag}>
                      <Ionicons name="pricetag-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.priceText}>{currentSuggestion.priceRange}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* AI Reason */}
                    <View style={styles.aiReason}>
                      <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.aiReasonText}>{currentSuggestion.reason}</Text>
                    </View>

                    {/* Alternatives */}
                    {currentSuggestion.alternatives && currentSuggestion.alternatives.length > 0 && (
                      <View style={styles.alternativesSection}>
                        <Text style={styles.alternativesLabel}>Alternativas</Text>
                        <View style={styles.alternativesChips}>
                          {currentSuggestion.alternatives.map((alt, i) => (
                            <View key={i} style={styles.alternativeChip}>
                              <Text style={styles.alternativeChipText}>{alt}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Person Info Card */}
            {selectedPerson && (
              <TouchableOpacity
                style={styles.personCard}
                onPress={() =>
                  router.push({
                    pathname: '/gift-history',
                    params: { personId: selectedPerson.id },
                  })
                }
              >
                <View style={styles.personCardLeft}>
                  {selectedPerson.photoUri ? (
                    <Image source={{ uri: selectedPerson.photoUri }} style={styles.personAvatarImage} />
                  ) : (
                    <View style={styles.personAvatar}>
                      <Ionicons name="person" size={20} color={theme.colors.primary} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.personCardName}>{selectedPerson.name}</Text>
                    {selectedPerson.relationship && (
                      <Text style={styles.personCardRelation}>{selectedPerson.relationship}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.personCardRight}>
                  <Text style={styles.personCardAction}>Ver historico</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.roseGrey} />
                </View>
              </TouchableOpacity>
            )}

            {/* Chat CTA */}
            <TouchableOpacity style={styles.chatCta} onPress={handleOpenChat}>
              <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
              <View style={styles.chatCtaTextContainer}>
                <Text style={styles.chatCtaTitle}>Falar com Zift Brain</Text>
                <Text style={styles.chatCtaSubtitle}>Pergunte, refine ou peça mais ideias</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.roseGrey} />
            </TouchableOpacity>
          </ScrollView>

          {/* Fixed Action Footer */}
          <LinearGradient
            colors={[
              `${theme.colors.backgroundLight}00`,
              theme.colors.backgroundLight,
              theme.colors.backgroundLight,
            ]}
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => selectedPerson && loadSuggestionsFor(selectedPerson)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#1a1a1a" />
                <Text style={styles.primaryButtonText}>Gerar novas sugestoes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: `${theme.colors.backgroundLight}F2`,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
    flex: 1,
    textAlign: 'center',
  },
  chatHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },

  // ─── Picker ─────────────────────
  pickerContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  pickerHeader: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  pickerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: theme.colors.textMain,
    textAlign: 'center',
  },
  pickerSubtitle: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    textAlign: 'center',
  },
  pickerList: {
    gap: 12,
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    padding: 16,
    gap: 14,
  },
  pickerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  pickerAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCardInfo: {
    flex: 1,
    gap: 2,
  },
  pickerCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  pickerCardRelation: {
    fontSize: 13,
    color: theme.colors.roseGrey,
  },
  pickerLifestyles: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  pickerLifestyleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${theme.colors.primary}12`,
  },
  pickerLifestyleText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  addPersonButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // ─── Chat ──────────────────────
  chatScrollView: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  chatBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  chatBubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  chatAiIcon: {
    marginBottom: 4,
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    color: '#1a1a1a',
  },
  chatBubbleTextAssistant: {
    color: theme.colors.textMain,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: theme.colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
    gap: 10,
  },
  chatInputField: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.textMain,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendButtonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  chatImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chatImageLoadingText: {
    fontSize: 11,
    color: theme.colors.roseGrey,
    marginTop: 8,
  },
  chatImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  chatQuickActions: {
    marginTop: 4,
    gap: 8,
  },
  chatQuickLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chatQuickScroll: {
    gap: 8,
  },
  chatQuickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}10`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}25`,
  },
  chatQuickText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primaryDark,
    maxWidth: 120,
  },

  // ─── Suggestions ───────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.roseGrey,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.roseGrey,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: `${theme.colors.primary}20`,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 200,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    opacity: 0.8,
  },
  aiHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  tabActive: {
    backgroundColor: theme.colors.backgroundDark,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.roseGrey,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabMatch: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.roseGrey,
  },
  tabMatchActive: {
    color: theme.colors.primary,
  },
  cardContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  cardGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: `${theme.colors.primary}25`,
    borderRadius: 32,
    opacity: 0.5,
  },
  card: {
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  matchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  giftIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  giftImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 8,
  },
  imageGenLoadingText: {
    fontSize: 11,
    color: theme.colors.roseGrey,
    marginTop: 8,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 26,
    fontWeight: '500',
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}15`,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  divider: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  aiReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 8,
  },
  aiReasonText: {
    fontSize: 15,
    color: '#bab29c',
    lineHeight: 22,
    flex: 1,
  },
  alternativesSection: {
    width: '100%',
    marginTop: 8,
  },
  alternativesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  alternativesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  alternativeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  alternativeChipText: {
    fontSize: 12,
    color: '#bab29c',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    marginBottom: 12,
  },
  personCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  personCardName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  personCardRelation: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  personCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  personCardAction: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  chatCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: `${theme.colors.primary}08`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  chatCtaTextContainer: {
    flex: 1,
  },
  chatCtaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  chatCtaSubtitle: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 16,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
});
