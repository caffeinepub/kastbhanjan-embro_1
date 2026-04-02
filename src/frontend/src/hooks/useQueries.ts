import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, CustomOrder, Product } from "../backend.d";
import { useActor } from "./useActor";

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Embroidery T-Shirt",
    category: "Men",
    price: 799n,
    description:
      "Premium embroidery T-shirt with unique Nike swoosh embroidery design. Comfortable white cotton fabric, perfect for casual wear.",
    imageUrl:
      "/assets/img-20260330-wa0027-019d3f06-cf72-7642-b869-7a916a698175.jpg",
    rating: 4.8,
    reviewCount: 0n,
    inStock: false,
  },
  {
    id: 2n,
    name: "Premium Black Embroidered Cotton Shirt",
    category: "Men",
    price: 999n,
    description:
      "High-quality stitched embroidery (not print) with a stylish deer design on the chest. 100% pure cotton – soft, breathable, and comfortable for long wear. Full sleeves with a smart collar – perfect for both casual and semi-formal occasions.",
    imageUrl:
      "/assets/img-20260401-wa0005-019d4d1a-0193-7579-8cdf-471ced13f8d6.jpg",
    rating: 4.9,
    reviewCount: 0n,
    inStock: false,
  },
];

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        if (!actor) return MOCK_PRODUCTS;
        const products = await actor.getAllProducts();
        return products.length > 0 ? products : MOCK_PRODUCTS;
      } catch {
        return MOCK_PRODUCTS;
      }
    },
    enabled: !isFetching,
    initialData: MOCK_PRODUCTS,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<Cart | null>({
    queryKey: ["cart"],
    queryFn: async () => {
      try {
        if (!actor) return null;
        return await actor.getCart();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useSubmitCustomOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (order: Omit<CustomOrder, "timestamp">) => {
      if (!actor) throw new Error("Not authenticated");
      const fullOrder: CustomOrder = {
        ...order,
        timestamp: BigInt(Date.now()) * 1000000n,
      };
      return await actor.submitCustomOrder(fullOrder);
    },
  });
}
