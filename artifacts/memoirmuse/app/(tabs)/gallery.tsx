import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { GALLERY_ITEMS, GalleryItem } from "@/constants/data";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

const CATEGORY_COLORS: Record<string, string> = {
  Portrait: COLORS.primary,
  Manuscript: COLORS.accent,
  Theater: "#4A7A8C",
  Document: COLORS.success,
  History: "#6B4A8C",
  Movement: "#8C4A4A",
};

const GALLERY_GRADIENTS: [string, string][] = [
  [COLORS.primaryDark, COLORS.primary],
  [COLORS.accent, "#7A5518"],
  ["#2E5A6A", "#4A7A8C"],
  ["#2E6040", COLORS.success],
  ["#4A2E6A", "#6B4A8C"],
  ["#6A2E2E", "#8C4A4A"],
];

export default function GalleryScreen() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const categories = ["All", ...Array.from(new Set(GALLERY_ITEMS.map((i) => i.category)))];

  const filtered =
    activeCategory === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((i) => i.category === activeCategory);

  const handleOpen = async (item: GalleryItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItem(item);
  };

  const handleClose = () => setSelectedItem(null);

  const renderItem = ({ item, index }: { item: GalleryItem; index: number }) => {
    const gradient = GALLERY_GRADIENTS[index % GALLERY_GRADIENTS.length];
    const catColor = CATEGORY_COLORS[item.category] || COLORS.primary;

    return (
      <TouchableOpacity
        style={styles.galleryItem}
        onPress={() => handleOpen(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={gradient}
          style={styles.galleryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.galleryIconContainer}>
            <Feather name="image" size={28} color="rgba(255,255,255,0.7)" />
          </View>
          <View style={styles.galleryItemFooter}>
            <View style={[styles.categoryTag, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
            <Text style={styles.galleryItemYear}>{item.year}</Text>
          </View>
        </LinearGradient>
        <View style={styles.galleryItemInfo}>
          <Text style={styles.galleryItemTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Gallery</Text>
        <Text style={styles.headerSubtitle}>Historical Collection</Text>
      </LinearGradient>

      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                activeCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            {(() => {
              const idx = GALLERY_ITEMS.findIndex((i) => i.id === selectedItem.id);
              const gradient = GALLERY_GRADIENTS[idx % GALLERY_GRADIENTS.length];
              return (
                <LinearGradient
                  colors={gradient}
                  style={styles.modalHero}
                >
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={handleClose}
                  >
                    <Feather name="x" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  <View style={styles.modalHeroIcon}>
                    <Feather name="image" size={48} color="rgba(255,255,255,0.6)" />
                  </View>
                  <View style={styles.modalHeroMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{selectedItem.category}</Text>
                    </View>
                    <Text style={styles.modalYear}>{selectedItem.year}</Text>
                  </View>
                </LinearGradient>
              );
            })()}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedItem.title}</Text>
              <Text style={styles.modalDesc}>{selectedItem.description}</Text>
              <View style={styles.modalDivider} />
              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Feather name="calendar" size={14} color={COLORS.textMuted} />
                  <Text style={styles.modalMetaText}>circa {selectedItem.year}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Feather name="tag" size={14} color={COLORS.textMuted} />
                  <Text style={styles.modalMetaText}>{selectedItem.category}</Text>
                </View>
              </View>
              <View style={styles.historicalNote}>
                <Feather name="info" size={16} color={COLORS.accent} />
                <Text style={styles.historicalNoteText}>
                  This artifact is part of the Pedro S. Tolentino cultural heritage
                  collection, preserved to educate future generations about his
                  contributions to Philippine literature and nationalism.
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontStyle: "italic",
  },
  filterRow: {
    backgroundColor: COLORS.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    gap: 12,
    justifyContent: "space-between",
  },
  galleryItem: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  galleryGradient: {
    height: 160,
    padding: 16,
    justifyContent: "space-between",
  },
  galleryIconContainer: {
    alignSelf: "flex-end",
  },
  galleryItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
  galleryItemYear: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  galleryItemInfo: {
    padding: 12,
  },
  galleryItemTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHero: {
    height: 200,
    padding: 24,
    paddingTop: 48,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  modalHeroIcon: {
    alignSelf: "center",
  },
  modalHeroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.white,
  },
  modalYear: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },
  modalMetaRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  modalMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalMetaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
  },
  historicalNote: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.surfaceWarm,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  historicalNoteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
