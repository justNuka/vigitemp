import { useEffect, useRef, useCallback, useState } from "react";

interface UseVirtualizedPaginationProps {
  totalItems: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface VirtualizationState {
  visibleCount: number;
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

/**
 * Hook personnalisé pour pagination virtualisée et responsive
 * Détecte:
 * - La taille de l'écran pour calculer le nombre de cards visibles
 * - Le scroll pour charger progressivement
 * - La hauteur de la grille pour optimiser le rendu
 */
export function useVirtualizedPagination({
  totalItems,
  containerRef,
}: UseVirtualizedPaginationProps) {
  const [state, setState] = useState<VirtualizationState>({
    visibleCount: 8, // Par défaut
    currentPage: 1,
    hasMore: totalItems > 8,
    isLoading: false,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Calculer le nombre de cards visibles basé sur la taille de l'écran
  const calculateVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return 8;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Breakpoints basés sur Tailwind:
    // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
    // Grille: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5

    let colCount: number;
    if (width < 640) {
      colCount = 1; // sm: 1 colonne
    } else if (width < 768) {
      colCount = 2; // sm: 2 colonnes
    } else if (width < 1024) {
      colCount = 3; // md: 3 colonnes
    } else if (width < 1280) {
      colCount = 4; // lg: 4 colonnes
    } else if (width < 1536) {
      colCount = 5; // xl: 5 colonnes
    } else {
      colCount = 6; // 2xl: 6 colonnes+
    }

    // Calculer le nombre de rangées visibles
    // Card hauteur ~400px + gap-10 (40px) = 440px total
    // Toolbar/header = ~120px
    // Footer = ~60px
    // Padding = ~60px
    const availableHeight = height - 240; // Hauteur disponible après header/footer/padding
    const cardHeight = 440; // Hauteur d'une card + gap
    const rowCount = Math.max(1, Math.ceil(availableHeight / cardHeight));

    const visibleCount = colCount * rowCount;

    // Ajouter une buffer de 1 rangée supplémentaire pour smooth scrolling
    return Math.min(visibleCount + colCount, totalItems);
  }, [totalItems]);

  // Mettre à jour le nombre de cards visibles au changement de taille
  useEffect(() => {
    const visibleCount = calculateVisibleCount();
    setState((prev) => ({
      ...prev,
      visibleCount: Math.max(4, visibleCount), // Minimum 4 cards
      hasMore: totalItems > visibleCount,
    }));

    const handleResize = () => {
      const newVisibleCount = calculateVisibleCount();
      setState((prev) => ({
        ...prev,
        visibleCount: Math.max(4, newVisibleCount),
        hasMore: totalItems > newVisibleCount,
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateVisibleCount, totalItems]);

  // Observer pour charger plus de cards au scroll
  useEffect(() => {
    if (!loadMoreRef.current || !state.hasMore) return;

    // Options pour Intersection Observer:
    // - rootMargin: 200px = charger quand le bouton est à 200px du viewport
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "200px", // Charger avant que l'utilisateur ne scroll jusqu'au bouton
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !state.isLoading && state.hasMore) {
        loadMore();
      }
    }, observerOptions);

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state.hasMore, state.isLoading]);

  const loadMore = useCallback(() => {
    setState((prev) => {
      const nextPage = prev.currentPage + 1;
      const totalLoaded = nextPage * prev.visibleCount;
      const hasMore = totalLoaded < totalItems;

      return {
        ...prev,
        currentPage: nextPage,
        hasMore,
        isLoading: false,
      };
    });
  }, [totalItems]);

  const getDisplayedItems = useCallback(
    (items: any[]) => {
      const endIndex = state.visibleCount * state.currentPage;
      return items.slice(0, endIndex);
    },
    [state.visibleCount, state.currentPage]
  );

  return {
    // État
    visibleCount: state.visibleCount,
    displayedCount: Math.min(state.visibleCount * state.currentPage, totalItems),
    totalItems,
    hasMore: state.hasMore,
    isLoading: state.isLoading,

    // Actions
    loadMore,
    getDisplayedItems,

    // Refs pour l'observer
    loadMoreRef,
    containerRef,
  };
}
