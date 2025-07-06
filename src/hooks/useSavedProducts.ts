// src/hooks/useSavedProducts.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";
import { fetchSavedProductIds, toggleSaveProduct } from "../api/user";

/**
 * Custom hook for managing the user's saved product IDs.
 * Handles loading, error, and (un)save logic.
 */
export const useSavedProducts = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  // --- Fetch saved product IDs for the current user ---
  const {
    data: savedProductIds = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<number[]>({
    queryKey: ["savedProducts"],
    queryFn: () => user ? fetchSavedProductIds() : [],
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  // --- Toggle product saved/unsaved state ---
  const toggleSave = async (productId: number) => {
    if (!user) return toast.warn("🔒 Log in to save products!");
    const isSaved = savedProductIds.includes(productId);
    try {
      await toggleSaveProduct(productId, isSaved);
      await queryClient.invalidateQueries({ queryKey: ["savedProducts"] });
      toast.success(isSaved ? "Removed from saved." : "Product saved!");
    } catch {
      toast.error("❌ Error saving product.");
    }
  };

  return {
    savedProductIds,
    toggleSaveProduct: toggleSave,
    isLoading,
    isError,
    refetch,
  };
};
