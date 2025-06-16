export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    category?: Category;
    images?: ProductImage[];
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    image?: string;
    productCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    productId: number;
}
