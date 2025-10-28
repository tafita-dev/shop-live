import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Live } from '@/types/live';
import { Eye, Calendar, User, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
// Utiliser 100% de la largeur du conteneur pour un affichage en liste vertical moderne
const cardWidth = isWeb ? Math.min(600, width - 40) : width - 40;

// Couleurs clés (Thème)
const COLORS = {
  PRIMARY: '#EC4899', // Rose Vif
  REPLAY: '#64748b', // Gris Bleu (pour Rediffusion)
  UPCOMING: '#10b981', // Vert Vif (pour À venir)
  BACKGROUND: '#f8fafc', // Fond Clair (Gris très léger)
  TEXT_DARK: '#1a1a1a',
  TEXT_LIGHT: '#666',
};

// --- LOGIQUE DE STATUT ---
type LiveStatus = 'LIVE' | 'REPLAY' | 'UPCOMING';

/**
 * Détermine le statut du live en se basant sur la date et le statut actif.
 * @param item L'objet Live
 * @returns Le statut du live: 'LIVE', 'REPLAY', ou 'UPCOMING'.
 */
const getLiveStatus = (item: Live): LiveStatus => {
  // 1. Priorité: Si 'isActive' est vrai, c'est LIVE.
  if (item.isActive) {
    return 'LIVE';
  }

  // 2. Vérification de la date: Si non actif, comparer la date de l'événement.
  let liveDate: Date;

  if (item.createdAt instanceof Date) {
    liveDate = item.createdAt;
  } else if (item.createdAt) {
    // Tentative de créer une date à partir de la valeur si elle existe
    liveDate = new Date(item.createdAt);
  } else {
    // Si la date est invalide/manquante, le considérer comme terminé/rediffusion par défaut.
    return 'REPLAY';
  }

  const now = new Date();

  // Si la date est dans le futur, c'est 'UPCOMING' (À VENIR)
  if (liveDate > now) {
    return 'UPCOMING';
  }

  // Si non actif ET date passée, c'est 'REPLAY' (REDIFFUSION)
  return 'REPLAY';
};
// -------------------------

export default function HomeScreen() {
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);

  // Cette dépendance permet de s'assurer que les lives basculent de 'À VENIR' à 'REDIFFUSION'
  // si leur date de début est dépassée, sans redémarrage de l'application.
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Écouteur en temps réel sur la collection 'lives'
    const q = query(collection(db, 'lives'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveList: Live[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(); // Date par défaut si non valide

          return {
            objectId: doc.id,
            id: doc.id,
            profile: data.profile || '',
            title: data.title || 'Live sans titre',
            createdAt,
            facebookIframeUrl: data.facebookIframeUrl || '',
            isActive: data.isActive ?? false,
            vendorId: data.vendorId || '',
            vendorName: data.vendorName || 'Vendeur Inconnu',
          } as Live;
        });

        setLives(liveList);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur de chargement des lives :', error);
        setLoading(false);
      },
    );

    // Mettre à jour l'heure actuelle toutes les minutes
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  /** Formate une date en chaîne lisible en français. */
  function formatDate(date: any): string {
    const jsDate =
      date instanceof Timestamp ? date.toDate() : new Date(date ?? Date.now());

    return jsDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const renderItem: ListRenderItem<Live> = ({ item }) => {
    // Déterminer le statut et configurer l'interface
    const status = getLiveStatus(item);

    let badgeStyle = styles.offlineBadge;
    let badgeText = 'REDIFFUSION';
    let buttonText = 'Revoir';
    let buttonColor = COLORS.REPLAY;
    let icon = <Calendar size={12} color="#fff" strokeWidth={2} />;

    if (status === 'LIVE') {
      badgeStyle = styles.liveBadge;
      badgeText = 'EN DIRECT';
      buttonText = 'Rejoindre';
      buttonColor = COLORS.PRIMARY;
      icon = <Eye size={16} color="white" strokeWidth={2} />; // Icône 'Eye' pour l'action Live
    } else if (status === 'UPCOMING') {
      badgeStyle = styles.upcomingBadge;
      badgeText = 'À VENIR';
      buttonText = 'Notifier';
      buttonColor = COLORS.UPCOMING;
      icon = <Clock size={12} color="#fff" strokeWidth={2} />;
    }

    const showLivePulse = status === 'LIVE';

    return (
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.profile ||
                'https://via.placeholder.com/600x400?text=Live+Image',
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          <View style={styles.overlay} />

          {/* Badge de statut */}
          <View
            style={[
              styles.badgeContainer,
              showLivePulse && styles.livePulseContainer,
            ]}
          >
            {showLivePulse && <View style={styles.livePulse} />}
            <View style={[styles.badge, badgeStyle]}>
              {status === 'LIVE' && <View style={styles.liveDot} />}
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          </View>

          {/* Date de l'événement */}
          <View style={styles.dateContainer}>
            {/* L'icône change en fonction du statut (Calendar, Clock, Eye) */}
            {icon}
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.vendorContainer}>
              <User size={14} color={COLORS.TEXT_LIGHT} strokeWidth={2} />
              <Text style={styles.vendor} numberOfLines={1}>
                {item.vendorName}
              </Text>
            </View>
          </View>

          {/* Bouton d'action */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(live)/livedetails?id=${item.vendorId}&link=${item.facebookIframeUrl}`,
              )
            }
            style={[
              styles.button,
              { backgroundColor: buttonColor, shadowColor: buttonColor },
            ]}
            activeOpacity={0.8}
          >
            <Eye size={16} color="white" strokeWidth={2} />
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucun live trouvé</Text>
      <Text style={styles.emptySubtext}>
        Les nouveaux événements en direct ou les rediffusions apparaîtront ici.
      </Text>
    </View>
  );

  // Écran de chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Chargement des événements...</Text>
      </View>
    );
  }

  // Rendu principal
  return (
    <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.drawerContainer}>
      <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Événements en direct</Text>
            <View style={styles.liveCountBadge}>
              <View style={styles.liveCountDot} />
              <Text style={styles.liveCountText}>
                {lives.filter((l) => getLiveStatus(l) === 'LIVE').length} en
                direct
              </Text>
            </View>
          </View>

          <FlatList
            data={lives}
            keyExtractor={(item) => item.id ?? item.vendorId}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              lives.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  drawerContainer: {
    flex: 1,

    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Ajustement pour l'entête sur iOS
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
  },
  liveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.PRIMARY,
    marginRight: 6,
  },
  liveCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e4e8',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  livePulseContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  livePulse: {
    position: 'absolute',
    width: 40,
    height: 25,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
    top: -3,
    left: -3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  liveBadge: {
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  upcomingBadge: {
    backgroundColor: COLORS.UPCOMING, // Vert pour À VENIR
  },
  offlineBadge: {
    backgroundColor: COLORS.REPLAY, // Gris pour REDIFFUSION
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.TEXT_DARK,
    lineHeight: 24,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  vendor: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },
});
