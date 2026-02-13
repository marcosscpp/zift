import { Presenteado } from './presenteados';
import { GiftRecord, getGiftsByPerson } from './giftHistory';
import { getEvents, CalendarEvent } from './events';
import Constants from 'expo-constants';

export interface AISuggestion {
  giftName: string;
  category: string;
  priceRange: string;
  reason: string;
  matchPercentage: number;
  alternatives: string[];
  imageUrl?: string;
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const getApiKey = (): string => {
  return (
    Constants.expoConfig?.extra?.openaiApiKey ||
    process.env.OPENAI_API_KEY ||
    ''
  );
};

const LIFESTYLE_LABELS: Record<string, string> = {
  viagem: 'Viagem',
  gourmet: 'Gourmet',
  arte: 'Arte',
  moda: 'Moda',
  tech: 'Tecnologia',
  'bem-estar': 'Bem-estar',
};

const buildPersonProfile = async (person: Presenteado): Promise<string> => {
  const gifts = await getGiftsByPerson(person.id);
  const events = await getEvents();
  const personEvents = events.filter((e) => e.personId === person.id);

  const lines: string[] = [];
  lines.push(`Nome: ${person.name}`);
  if (person.relationship) lines.push(`Vinculo: ${person.relationship}`);
  if (person.birthday) lines.push(`Aniversario: ${person.birthday}`);

  if (person.shoeSize) lines.push(`Calcado: ${person.shoeSize}`);
  if (person.shirtSize) lines.push(`Camiseta: ${person.shirtSize}`);
  if (person.pantsSize) lines.push(`Calca: ${person.pantsSize}`);
  if (person.dressSize) lines.push(`Roupa: ${person.dressSize}`);
  if (person.ringSize) lines.push(`Anel: ${person.ringSize}`);

  if (person.lifestyles && person.lifestyles.length > 0) {
    const labels = person.lifestyles.map((l) => LIFESTYLE_LABELS[l] || l);
    lines.push(`Estilos de vida: ${labels.join(', ')}`);
  }

  if (person.observations) {
    lines.push(`Observacoes: ${person.observations}`);
  }

  if (gifts.length > 0) {
    lines.push(`\nHistorico de presentes:`);
    gifts.forEach((g) => {
      const liked = g.liked === true ? ' (gostou)' : g.liked === false ? ' (nao gostou)' : '';
      lines.push(`- ${g.giftName} em ${g.date} para ${g.occasion || 'ocasiao nao especificada'}${liked}`);
    });
  }

  if (personEvents.length > 0) {
    lines.push(`\nProximos eventos:`);
    personEvents.forEach((e) => {
      lines.push(`- ${e.title} em ${e.date}`);
    });
  }

  return lines.join('\n');
};

export const getSuggestions = async (
  person: Presenteado,
  occasion?: string,
  budget?: string
): Promise<AISuggestion[]> => {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === 'sk-sua-chave-aqui') {
    return getOfflineSuggestions(person, occasion);
  }

  try {
    const profile = await buildPersonProfile(person);

    const systemPrompt = `Voce e o Zift Brain, um assistente de curadoria de presentes de luxo.
Voce deve sugerir presentes personalizados baseado no perfil da pessoa.
Responda SEMPRE em JSON valido com o seguinte formato:
[
  {
    "giftName": "nome do presente",
    "category": "categoria",
    "priceRange": "R$ X - R$ Y",
    "reason": "motivo da sugestao em 1-2 frases",
    "matchPercentage": 95,
    "alternatives": ["alternativa 1", "alternativa 2"]
  }
]
Sugira exatamente 3 presentes, do mais recomendado ao menos.`;

    const userMessage = `Perfil da pessoa:\n${profile}\n\n${
      occasion ? `Ocasiao: ${occasion}\n` : ''
    }${budget ? `Orcamento: ${budget}\n` : ''}Sugira 3 presentes ideais.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log('OpenAI API error:', response.status);
      return getOfflineSuggestions(person, occasion);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return getOfflineSuggestions(person, occasion);
    }

    const suggestions: AISuggestion[] = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.log('Zift Brain error:', error);
    return getOfflineSuggestions(person, occasion);
  }
};

export const chatWithZiftBrain = async (
  messages: ChatMessage[],
  person: Presenteado
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'sk-sua-chave-aqui') {
    return 'Desculpe, o Zift Brain esta indisponivel no modo offline. Configure sua chave da API OpenAI.';
  }

  const profile = await buildPersonProfile(person);
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `Voce e o Zift Brain, um concierge digital de presentes de luxo.
Voce esta ajudando a encontrar o presente ideal para esta pessoa:

${profile}

Responda sempre em portugues brasileiro. Seja sofisticado mas acessivel.
Ajude com sugestoes, refinamentos, e conselhos sobre presentes.
Seja conciso nas respostas (maximo 3-4 frases).`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) return 'Desculpe, ocorreu um erro. Tente novamente.';
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sem resposta.';
  } catch {
    return 'Erro de conexao. Verifique sua internet.';
  }
};

export const generateGiftImage = async (
  giftName: string,
  person?: Presenteado
): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'sk-sua-chave-aqui') return null;

  let prompt: string;

  if (person?.photoUri && person?.name) {
    prompt = `A stylish person happily using/wearing "${giftName}" as a luxury gift. The scene is elegant with warm lighting, champagne gold accent tones, lifestyle photography style. The person looks delighted and sophisticated. High-end product placement.`;
  } else {
    prompt = `A beautiful, photorealistic product image of "${giftName}" as a luxury gift. Elegant presentation on a marble surface, studio lighting with champagne gold accent tones, high-end product photography style. Clean background.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      console.log('DALL-E error:', response.status);
      return null;
    }
    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.log('Image generation error:', error);
    return null;
  }
};

const getOfflineSuggestions = (
  person: Presenteado,
  occasion?: string
): AISuggestion[] => {
  const baseByRelationship: Record<string, AISuggestion[]> = {
    'Conjuge': [
      {
        giftName: 'Kit Spa Premium',
        category: 'Bem-estar',
        priceRange: 'R$ 200 - R$ 500',
        reason: 'Experiencia de relaxamento perfeita para demonstrar cuidado e carinho.',
        matchPercentage: 92,
        alternatives: ['Jantar Romantico', 'Joia Personalizada'],
      },
      {
        giftName: 'Perfume Importado',
        category: 'Fragrancia',
        priceRange: 'R$ 300 - R$ 800',
        reason: 'Um perfume exclusivo que combina com a personalidade unica.',
        matchPercentage: 88,
        alternatives: ['Kit de Skincare', 'Bolsa de Grife'],
      },
      {
        giftName: 'Viagem Surpresa',
        category: 'Experiencia',
        priceRange: 'R$ 1.000 - R$ 5.000',
        reason: 'Momentos juntos valem mais que qualquer objeto material.',
        matchPercentage: 85,
        alternatives: ['Cruzeiro', 'Hotel Boutique'],
      },
    ],
    default: [
      {
        giftName: 'Caixa de Chocolates Artesanais',
        category: 'Gourmet',
        priceRange: 'R$ 100 - R$ 300',
        reason: 'Presente versatil e sofisticado que agrada a todos.',
        matchPercentage: 90,
        alternatives: ['Kit de Vinhos', 'Cesta Gourmet'],
      },
      {
        giftName: 'Livro Personalizado',
        category: 'Cultura',
        priceRange: 'R$ 50 - R$ 200',
        reason: 'Um presente pensado que mostra que voce conhece a pessoa.',
        matchPercentage: 85,
        alternatives: ['Assinatura de Revista', 'E-reader'],
      },
      {
        giftName: 'Experiencia Gastronomica',
        category: 'Experiencia',
        priceRange: 'R$ 200 - R$ 600',
        reason: 'Criar memorias e algo que nunca perde o valor.',
        matchPercentage: 82,
        alternatives: ['Aula de Culinaria', 'Degustacao de Vinhos'],
      },
    ],
  };

  const rel = person.relationship || 'default';
  return baseByRelationship[rel] || baseByRelationship['default'];
};
