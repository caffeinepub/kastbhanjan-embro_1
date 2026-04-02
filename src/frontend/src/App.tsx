import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Twitter,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import {
  useAddToCart,
  useCart,
  useProducts,
  useRemoveFromCart,
  useSubmitCustomOrder,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

const CATEGORIES = [
  "All",
  "New Arrivals",
  "Men",
  "Bestsellers",
  "Festive Collection",
  "Sale",
];
const CATEGORY_CHIPS = [{ name: "Men", emoji: "🧔", color: "bg-blue-100" }];

interface LocalCartItem {
  productId: bigint;
  quantity: number;
}

function AppContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [wishlist, setWishlist] = useState<bigint[]>([]);

  const { data: products = [] } = useProducts();
  const { data: backendCart } = useCart();
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const submitOrderMutation = useSubmitCustomOrder();

  const [orderForm, setOrderForm] = useState({
    customerName: "",
    email: "",
    contactNo: "",
    orderDetails: "",
  });

  // Sync backend cart if available
  useEffect(() => {
    if (backendCart?.items && backendCart.items.length > 0) {
      setLocalCart(
        backendCart.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
      );
    }
  }, [backendCart]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItems = localCart
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product!.price) * item.quantity,
    0,
  );
  const cartCount = localCart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(product: Product) {
    setLocalCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    // Also sync with backend if possible
    try {
      addToCartMutation.mutate({ productId: product.id, quantity: 1n });
    } catch {}
    toast.success(`${product.name} added to cart!`, {
      description: `₹${Number(product.price).toLocaleString("en-IN")}`,
    });
  }

  function updateCartQuantity(productId: bigint, delta: number) {
    setLocalCart((prev) => {
      return prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0);
    });
  }

  function removeFromCart(productId: bigint) {
    setLocalCart((prev) => prev.filter((i) => i.productId !== productId));
    try {
      removeFromCartMutation.mutate(productId);
    } catch {}
  }

  function toggleWishlist(productId: bigint) {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitOrderMutation.mutateAsync(orderForm);
      toast.success("Custom order submitted!", {
        description: "We'll contact you within 24 hours.",
      });
      setOrderForm({
        customerName: "",
        email: "",
        contactNo: "",
        orderDetails: "",
      });
    } catch {
      toast.error("Failed to submit order. Please try again.");
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F3EE" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#F1E2CD",
          borderBottom: "1px solid #D8C3A3",
        }}
        className="sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/assets/kastbhanjan-logo.webp"
                alt="Kastbhanjan Embro Logo"
                className="w-14 h-14 rounded-full object-cover border-2"
                style={{ borderColor: "#C6A24A" }}
              />
              <div className="hidden sm:block">
                <h1
                  className="font-serif text-xl font-bold"
                  style={{ color: "#4B0E10" }}
                >
                  KASTBHANJAN
                </h1>
                <p
                  className="text-xs tracking-widest"
                  style={{ color: "#C6A24A" }}
                >
                  EMBRO
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#6A635B" }}
                />
                <Input
                  data-ocid="search.search_input"
                  placeholder="Search for T-shirts, Men's wear..."
                  className="pl-10 border"
                  style={{ backgroundColor: "white", borderColor: "#D8C3A3" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                style={{ backgroundColor: "#C6A24A", color: "white" }}
                className="px-6 hover:opacity-90"
              >
                Search
              </Button>
            </div>

            {/* Utility icons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 text-xs"
                style={{ color: "#4B0E10" }}
                aria-label="Account"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">Account</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 text-xs"
                style={{ color: "#4B0E10" }}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden md:block">Wishlist</span>
              </button>
              <button
                type="button"
                data-ocid="cart.open_modal_button"
                className="flex flex-col items-center gap-0.5 text-xs relative"
                style={{ color: "#4B0E10" }}
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ backgroundColor: "#C6A24A", fontSize: "10px" }}
                  >
                    {cartCount}
                  </span>
                )}
                <span className="hidden md:block">Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category nav */}
        <nav style={{ backgroundColor: "#4B0E10" }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  data-ocid="nav.tab"
                  className="px-4 py-2 text-sm whitespace-nowrap rounded transition-colors"
                  style={{
                    color: activeCategory === cat ? "#C6A24A" : "#F1E2CD",
                    backgroundColor:
                      activeCategory === cat
                        ? "rgba(198,162,74,0.15)"
                        : "transparent",
                    fontWeight: activeCategory === cat ? "600" : "400",
                  }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Banner */}
        <section
          className="relative overflow-hidden"
          style={{ minHeight: "480px" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-indian-fashion.dim_1200x500.jpg')",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(58,15,16,0.88) 0%, rgba(75,14,16,0.65) 50%, transparent 100%)",
            }}
          />
          <div
            className="relative max-w-7xl mx-auto px-4 py-20 flex items-center"
            style={{ minHeight: "480px" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl"
            >
              <p
                className="text-sm tracking-widest mb-3"
                style={{ color: "#C6A24A" }}
              >
                NEW MEN'S COLLECTION 2024
              </p>
              <h2
                className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4"
                style={{ color: "#C6A24A" }}
              >
                CELEBRATE
                <br />
                TRADITION
                <br />
                IN STYLE
              </h2>
              <p
                className="text-base mb-8"
                style={{ color: "#F1E2CD", opacity: 0.9 }}
              >
                Discover exquisite embroidered T-shirts & men's wear crafted
                with love in Rajkot, Gujarat
              </p>
              <div className="flex gap-3">
                <Button
                  data-ocid="hero.primary_button"
                  className="px-8 py-3 text-base font-semibold hover:opacity-90"
                  style={{ backgroundColor: "#C6A24A", color: "#1F1F1F" }}
                  onClick={() =>
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Shop Now
                </Button>
                <Button
                  data-ocid="hero.secondary_button"
                  variant="outline"
                  className="px-8 py-3 text-base border-2"
                  style={{
                    borderColor: "#F1E2CD",
                    color: "#F1E2CD",
                    backgroundColor: "transparent",
                  }}
                  onClick={() =>
                    document
                      .getElementById("custom-order")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Custom Order
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Shop by Category Chips */}
        <section className="py-10" style={{ backgroundColor: "#F6F3EE" }}>
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className="font-serif text-2xl font-bold mb-6 text-center"
              style={{ color: "#4B0E10" }}
            >
              Shop by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {CATEGORY_CHIPS.map((chip) => (
                <motion.button
                  key={chip.name}
                  data-ocid="category.tab"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setActiveCategory(chip.name);
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md ${chip.color} border-4`}
                    style={{
                      borderColor:
                        activeCategory === chip.name ? "#C6A24A" : "#D8C3A3",
                    }}
                  >
                    {chip.emoji}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#4B0E10" }}
                  >
                    {chip.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section
          id="products"
          className="py-10"
          style={{ backgroundColor: "#F6F3EE" }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="font-serif text-2xl font-bold"
                style={{ color: "#4B0E10" }}
              >
                {activeCategory === "All"
                  ? "Featured Collection"
                  : activeCategory}
              </h2>
              <span className="text-sm" style={{ color: "#6A635B" }}>
                {filteredProducts.length} products
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div
                data-ocid="products.empty_state"
                className="text-center py-20"
                style={{ color: "#6A635B" }}
              >
                <p className="text-lg">
                  No products found for "{activeCategory}"
                </p>
                <Button
                  className="mt-4"
                  style={{ backgroundColor: "#4B0E10", color: "white" }}
                  onClick={() => setActiveCategory("All")}
                >
                  View All
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={String(product.id)}
                    product={product}
                    index={idx + 1}
                    isWishlisted={wishlist.includes(product.id)}
                    onAddToCart={() => addToCart(product)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Custom Order Section */}
        <section
          id="custom-order"
          className="py-12"
          style={{ backgroundColor: "#4B0E10" }}
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p
                  className="text-sm tracking-widest mb-2"
                  style={{ color: "#C6A24A" }}
                >
                  PERSONALIZED FOR YOU
                </p>
                <h2 className="font-serif text-3xl font-bold mb-4 text-white">
                  Custom Order
                  <br />
                  Your Dream Outfit
                </h2>
                <p className="mb-6" style={{ color: "#F1E2CD", opacity: 0.85 }}>
                  Have a unique design in mind? Tell us your vision and our
                  skilled artisans in Rajkot will craft it just for you. From
                  men's embroidery wear to festive outfits, we bring your ideas
                  to life.
                </p>
                <ul className="space-y-2" style={{ color: "#C6A24A" }}>
                  {[
                    "Handcrafted by skilled artisans",
                    "Premium quality fabrics",
                    "Delivery within 15-20 days",
                    "Free design consultation",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-sm" style={{ color: "#F1E2CD" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <form
                onSubmit={handleOrderSubmit}
                className="rounded-xl p-6 space-y-4"
                style={{
                  backgroundColor: "rgba(246,243,238,0.07)",
                  border: "1px solid rgba(198,162,74,0.3)",
                }}
              >
                <Input
                  data-ocid="order.input"
                  required
                  placeholder="Your Full Name"
                  value={orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      customerName: e.target.value,
                    }))
                  }
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(198,162,74,0.4)",
                    color: "white",
                  }}
                  className="placeholder:text-gray-400"
                />
                <Input
                  data-ocid="order.input"
                  required
                  type="email"
                  placeholder="Email Address"
                  value={orderForm.email}
                  onChange={(e) =>
                    setOrderForm((p) => ({ ...p, email: e.target.value }))
                  }
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(198,162,74,0.4)",
                    color: "white",
                  }}
                  className="placeholder:text-gray-400"
                />
                <Input
                  data-ocid="order.input"
                  required
                  placeholder="Contact Number"
                  value={orderForm.contactNo}
                  onChange={(e) =>
                    setOrderForm((p) => ({ ...p, contactNo: e.target.value }))
                  }
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(198,162,74,0.4)",
                    color: "white",
                  }}
                  className="placeholder:text-gray-400"
                />
                <div
                  className="text-sm px-3 py-2 rounded"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(198,162,74,0.4)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(198,162,74,0.4)",
                  }}
                >
                  Men
                </div>
                <Textarea
                  data-ocid="order.textarea"
                  required
                  placeholder="Describe your dream outfit - fabric, color, occasion, size details..."
                  rows={4}
                  value={orderForm.orderDetails}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      orderDetails: e.target.value,
                    }))
                  }
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(198,162,74,0.4)",
                    color: "white",
                  }}
                  className="placeholder:text-gray-400"
                />
                <Button
                  data-ocid="order.submit_button"
                  type="submit"
                  className="w-full py-3 text-base font-semibold hover:opacity-90"
                  style={{ backgroundColor: "#C6A24A", color: "#1F1F1F" }}
                  disabled={submitOrderMutation.isPending}
                >
                  {submitOrderMutation.isPending
                    ? "Submitting..."
                    : "Submit Custom Order Request"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#3A0F10", color: "#F1E2CD" }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/kastbhanjan-logo.webp"
                  alt="Logo"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p
                    className="font-serif font-bold"
                    style={{ color: "#C6A24A" }}
                  >
                    KASTBHANJAN
                  </p>
                  <p
                    className="text-xs tracking-widest"
                    style={{ color: "#C6A24A" }}
                  >
                    EMBRO
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-75">
                Crafting traditional Indian clothing with passion and precision
                since 2010. Based in Rajkot, Gujarat.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#C6A24A" }}>
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm opacity-80">
                {["New Arrivals", "Bestsellers", "Men"].map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(item);
                        window.scrollTo({ top: 0 });
                      }}
                      className="hover:text-gold-light transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#C6A24A" }}>
                Customer Support
              </h4>
              <ul className="space-y-2 text-sm opacity-80">
                {[
                  "Track Your Order",
                  "Returns & Exchange",
                  "Size Guide",
                  "Contact Us",
                  "FAQs",
                ].map((item) => (
                  <li key={item}>
                    <span className="cursor-pointer hover:opacity-100">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#C6A24A" }}>
                Contact Us
              </h4>
              <div className="text-sm opacity-80 space-y-2">
                <p>📍 Rajkot, Gujarat, India</p>
                <p>📞 +91 81280 37759</p>
                <a
                  href="https://wa.me/918128037759"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="contact.primary_button"
                  className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
                  style={{ backgroundColor: "#25D366", color: "white" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp: 8128037759
                </a>
                <p>✉️ info@kastbhanjanembro.com</p>
              </div>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://instagram.com"
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(198,162,74,0.2)" }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" style={{ color: "#C6A24A" }} />
                </a>
                <a
                  href="https://facebook.com"
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(198,162,74,0.2)" }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" style={{ color: "#C6A24A" }} />
                </a>
                <a
                  href="https://twitter.com"
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(198,162,74,0.2)" }}
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" style={{ color: "#C6A24A" }} />
                </a>
              </div>
            </div>
          </div>

          <div
            className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderColor: "rgba(198,162,74,0.2)" }}
          >
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} KASTBHANJAN EMBRO. All rights
              reserved.
            </p>
            <p className="text-sm opacity-60">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-100"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              data-ocid="cart.sheet"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl"
              style={{ backgroundColor: "#F6F3EE" }}
            >
              {/* Cart header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ backgroundColor: "#4B0E10", color: "white" }}
              >
                <h3 className="font-serif text-lg font-bold">
                  Your Cart ({cartCount})
                </h3>
                <button
                  type="button"
                  data-ocid="cart.close_button"
                  onClick={() => setCartOpen(false)}
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div
                    data-ocid="cart.empty_state"
                    className="flex flex-col items-center justify-center h-full gap-4"
                    style={{ color: "#6A635B" }}
                  >
                    <ShoppingCart className="w-16 h-16 opacity-30" />
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <p className="text-sm text-center">
                      Add some beautiful traditional wear to your cart!
                    </p>
                    <Button
                      style={{ backgroundColor: "#4B0E10", color: "white" }}
                      onClick={() => setCartOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div
                      key={String(item.productId)}
                      data-ocid={`cart.item.${idx + 1}`}
                      className="flex gap-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #D8C3A3",
                      }}
                    >
                      <img
                        src={item.product!.imageUrl}
                        alt={item.product!.name}
                        className="w-20 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm line-clamp-2"
                          style={{ color: "#1F1F1F" }}
                        >
                          {item.product!.name}
                        </p>
                        <p
                          className="text-sm font-bold mt-1"
                          style={{ color: "#4B0E10" }}
                        >
                          ₹{Number(item.product!.price).toLocaleString("en-IN")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            data-ocid={`cart.secondary_button.${idx + 1}`}
                            className="w-7 h-7 rounded-full border flex items-center justify-center"
                            style={{ borderColor: "#D8C3A3" }}
                            onClick={() =>
                              updateCartQuantity(item.productId, -1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            data-ocid={`cart.primary_button.${idx + 1}`}
                            className="w-7 h-7 rounded-full border flex items-center justify-center"
                            style={{ borderColor: "#D8C3A3" }}
                            onClick={() =>
                              updateCartQuantity(item.productId, 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            data-ocid={`cart.delete_button.${idx + 1}`}
                            className="ml-auto text-xs"
                            style={{ color: "#B8913A" }}
                            onClick={() => removeFromCart(item.productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart footer */}
              {cartItems.length > 0 && (
                <div
                  className="p-4 border-t"
                  style={{ borderColor: "#D8C3A3", backgroundColor: "white" }}
                >
                  <div
                    className="flex justify-between mb-1 text-sm"
                    style={{ color: "#6A635B" }}
                  >
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div
                    className="flex justify-between mb-1 text-sm"
                    style={{ color: "#6A635B" }}
                  >
                    <span>Shipping</span>
                    <span style={{ color: "#4B8B3B" }}>FREE</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"
                    style={{ borderColor: "#D8C3A3", color: "#1F1F1F" }}
                  >
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <Button
                    data-ocid="cart.primary_button"
                    className="w-full mt-4 py-3 text-base font-semibold hover:opacity-90"
                    style={{ backgroundColor: "#4B0E10", color: "white" }}
                    onClick={() => {
                      toast.success("Proceeding to Checkout!", {
                        description: "Payment integration coming soon.",
                      });
                      setCartOpen(false);
                    }}
                  >
                    Proceed to Checkout →
                  </Button>
                  <Button
                    data-ocid="cart.secondary_button"
                    variant="outline"
                    className="w-full mt-2 border"
                    style={{ borderColor: "#4B0E10", color: "#4B0E10" }}
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </div>
  );
}

function ProductCard({
  product,
  index,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
}: {
  product: Product;
  index: number;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}) {
  return (
    <motion.div
      data-ocid={`products.item.${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
      style={{ backgroundColor: "white", border: "1px solid #D8C3A3" }}
    >
      <div className="relative overflow-hidden" style={{ height: "260px" }}>
        <img
          src={
            product.imageUrl ||
            `https://picsum.photos/seed/${String(product.id)}/400/500`
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          data-ocid={`products.toggle.${index}`}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: "white" }}
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            style={!isWishlisted ? { color: "#6A635B" } : {}}
          />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge style={{ backgroundColor: "#4B0E10", color: "white" }}>
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs mb-1" style={{ color: "#C6A24A" }}>
          {product.category}
        </p>
        <h3
          className="font-medium text-sm line-clamp-2 mb-2"
          style={{ color: "#1F1F1F" }}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={String(i)}
              className={`w-3 h-3 ${
                i < Math.round(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: "#6A635B" }}>
            ({Number(product.reviewCount)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: "#4B0E10" }}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <button
            type="button"
            data-ocid={`products.primary_button.${index}`}
            className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: product.inStock ? "#4B0E10" : "#D8C3A3",
              color: product.inStock ? "white" : "#6A635B",
            }}
            onClick={onAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
