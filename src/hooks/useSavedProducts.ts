import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { useUserContext } from "../context/UserContext";

export const useSavedProducts = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const {
    data: savedProductIds = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<number[]>({
    queryKey: ["savedProducts"],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/saved-products`, {
        withCredentials: true,
      });
      return res.data.map((p: { id: number }) => p.id);
    },
    enabled: !!user, // don't run query if not logged in
    staleTime: 1000 * 60, // 1 minute
  });

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

      // Use query invalidation instead of manual mutation
      await queryClient.invalidateQueries({ queryKey: ["savedProducts"] });
      toast.success(isSaved ? "Removed from saved!" : "Product saved!");
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
