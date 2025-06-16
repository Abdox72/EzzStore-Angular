import { Product } from "./product";

export interface OrderItem {
    product: Product;
    quantity: number;
}
export interface Order {
    id?: number;
    userId?: string;
    orderDate?: string;
    orderItems: OrderItem[];
}