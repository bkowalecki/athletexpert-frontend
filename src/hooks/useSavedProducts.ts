import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";

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
    queryFn: async () => {
      if (!user) return [];
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/saved-products`,
        { withCredentials: true }
      );
      // Defensive: Accept array of objects OR IDs
      return Array.isArray(data)
        ? data.map((p: { id: number } | number) =>
            typeof p === "number" ? p : p.id
          )
        : [];
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  // --- Toggle product saved/unsaved state ---
  const toggleSaveProduct = async (productId: number) => {
    if (!user) return toast.warn("🔒 Log in to save products!");
    const isSaved = savedProductIds.includes(productId);
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/users/saved-products/${productId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );
      // Invalidate to re-fetch latest data
      await queryClient.invalidateQueries({ queryKey: ["savedProducts"] });
      toast.success(isSaved ? "Removed from saved." : "Product saved!");
    } catch (err) {
      toast.error("❌ Error saving product.");
    }
  };

  return {
    savedProductIds,
    toggleSaveProduct,
    isLoading,
    isError,
    refetch,
  };
};
