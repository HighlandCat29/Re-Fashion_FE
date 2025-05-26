export interface Product {
    id: string;
    image: string;
    title: string;
    category: string;
    price: number;
    popularity?: number;  // optional
    stock?: number;       // optional
}
