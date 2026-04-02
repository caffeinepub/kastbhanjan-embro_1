import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize admin principal ID (replace with the actual admin principal)
  let adminPrincipalId = "gwcjg-lgyve-5kyp5-66swx-dpqzr-s6djr-a2wcu-gxqw6-awzea-vi5rg-lqe";
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Int;
    description : Text;
    imageUrl : Text;
    rating : Float;
    reviewCount : Nat;
    inStock : Bool;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Cart = {
    user : Principal;
    items : [CartItem];
  };

  type CustomOrder = {
    customerName : Text;
    contactNo : Text;
    email : Text;
    orderDetails : Text;
    timestamp : Time.Time;
  };

  type Order = CustomOrder;

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };

    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Int.compare(product1.price, product2.price);
    };

    public func compareByRating(product1 : Product, product2 : Product) : Order.Order {
      Float.compare(product2.rating, product1.rating);
    };
  };

  module CartItem {
    public func compare(cartItem1 : CartItem, cartItem2 : CartItem) : Order.Order {
      Nat.compare(cartItem1.productId, cartItem2.productId);
    };
  };

  module Cart {
    public func compare(cart1 : Cart, cart2 : Cart) : Order.Order {
      Principal.compare(cart1.user, cart2.user);
    };
  };

  module CustomOrder {
    public func compareByTimestamp(order1 : CustomOrder, order2 : CustomOrder) : Order.Order {
      Int.compare(order1.timestamp, order2.timestamp);
    };
  };

  let carts = Map.empty<Principal, Cart>();
  let customOrders = Map.empty<Text, CustomOrder>();

  let preSeededProducts = [
    {
      id = 1;
      name = "Banarasi Silk Saree";
      category = "Saree";
      price = 2500;
      description = "Elegant Banarasi silk saree with intricate zari work.";
      imageUrl = "https://example.com/saree1.jpg";
      rating = 4.7;
      reviewCount = 150;
      inStock = true;
    },
    {
      id = 2;
      name = "Cotton Kurta Set";
      category = "Kurta";
      price = 1500;
      description = "Comfortable cotton kurta set with vibrant prints.";
      imageUrl = "https://example.com/kurta1.jpg";
      rating = 4.5;
      reviewCount = 90;
      inStock = true;
    },
    {
      id = 3;
      name = "Bridal Lehenga";
      category = "Lehenga";
      price = 6000;
      description = "Stunning bridal lehenga with heavy embroidery.";
      imageUrl = "https://example.com/lehenga1.jpg";
      rating = 4.9;
      reviewCount = 70;
      inStock = true;
    },
    {
      id = 4;
      name = "Anarkali Gown";
      category = "Anarkali";
      price = 3500;
      description = "Flowy Anarkali gown with beautiful patterns.";
      imageUrl = "https://example.com/anarkali1.jpg";
      rating = 4.6;
      reviewCount = 110;
      inStock = true;
    },
    {
      id = 5;
      name = "Fusion Dress";
      category = "Fusion Wear";
      price = 2000;
      description = "Trendy fusion dress combining traditional and modern styles.";
      imageUrl = "https://example.com/fusion1.jpg";
      rating = 4.4;
      reviewCount = 80;
      inStock = true;
    },
    {
      id = 6;
      name = "Chanderi Saree";
      category = "Saree";
      price = 1800;
      description = "Lightweight Chanderi saree with minimalistic design.";
      imageUrl = "https://example.com/saree2.jpg";
      rating = 4.3;
      reviewCount = 60;
      inStock = false;
    },
    {
      id = 7;
      name = "Silk Kurta Pajama";
      category = "Kurta";
      price = 2200;
      description = "Premium silk kurta pajama for special occasions.";
      imageUrl = "https://example.com/kurta2.jpg";
      rating = 4.8;
      reviewCount = 40;
      inStock = true;
    },
    {
      id = 8;
      name = "Embroidered Lehenga";
      category = "Lehenga";
      price = 4500;
      description = "Gorgeous lehenga with detailed embroidery work.";
      imageUrl = "https://example.com/lehenga2.jpg";
      rating = 4.6;
      reviewCount = 50;
      inStock = false;
    },
  ];

  public query ({ caller }) func getAllProducts() : async [Product] {
    preSeededProducts.sort();
  };

  public query ({ caller }) func getAllProductsByPrice() : async [Product] {
    preSeededProducts.sort(Product.compareByPrice);
  };

  public query ({ caller }) func getAllProductsByRating() : async [Product] {
    preSeededProducts.sort(Product.compareByRating);
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (preSeededProducts.find(func(product) { product.id == productId })) {
      case (null) { Runtime.trap("Product not found.") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart");
    };
    switch (carts.get(caller)) {
      case (null) {
        Runtime.trap("No cart found for user. Please add items to your cart first.");
      };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func submitCustomOrder(order : CustomOrder) : async Text {
    let orderId = Time.now().toText() # order.customerName;
    let newOrder : Order = {
      order with
      timestamp = Time.now();
    };
    customOrders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getAllCustomOrders() : async [CustomOrder] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin privileges required to view all custom orders");
    };
    customOrders.values().toArray().sort(CustomOrder.compareByTimestamp);
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };
    if (quantity == 0) {
      Runtime.trap("Quantity must be at least 1");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { { user = caller; items = [] } };
      case (?cart) { cart };
    };

    let existingItems = List.fromArray<CartItem>(currentCart.items);
    let oldSize = existingItems.size();
    let filteredItems = existingItems.filter(
      func(cartItem) { cartItem.productId != productId }
    );
    let cartItemCount = oldSize - filteredItems.size();
    let newCartItem : CartItem = { productId; quantity };
    filteredItems.add(newCartItem);
    carts.add(caller, { user = caller; items = filteredItems.toArray() });
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };
    let existingCart = switch (carts.get(caller)) {
      case (null) {
        Runtime.trap("No cart found for user. Please add items to your cart first.");
      };
      case (?cart) { cart };
    };

    let itemsToFilter = List.fromArray<CartItem>(existingCart.items);
    let oldSize = itemsToFilter.size();
    let filteredItems = itemsToFilter.filter(
      func(cartItem) { cartItem.productId != productId }
    );
    let cartItemCount = oldSize - filteredItems.size();

    if (cartItemCount == 0) {
      Runtime.trap("Product not found in cart");
    };

    carts.add(caller, { user = caller; items = filteredItems.toArray() });
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    if (not (carts.containsKey(caller))) {
      Runtime.trap("No cart found for user. Please add items to your cart first.");
    };
    carts.add(caller, { user = caller; items = [] });
  };
};
