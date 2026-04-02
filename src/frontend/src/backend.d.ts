import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cart {
    user: Principal;
    items: Array<CartItem>;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export type Time = bigint;
export interface CustomOrder {
    customerName: string;
    orderDetails: string;
    email: string;
    timestamp: Time;
    contactNo: string;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    rating: number;
    price: bigint;
    reviewCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    getAllCustomOrders(): Promise<Array<CustomOrder>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllProductsByPrice(): Promise<Array<Product>>;
    getAllProductsByRating(): Promise<Array<Product>>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getProduct(productId: bigint): Promise<Product>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: bigint): Promise<void>;
    submitCustomOrder(order: CustomOrder): Promise<string>;
}
