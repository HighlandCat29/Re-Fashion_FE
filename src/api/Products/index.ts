export interface Product {
  id?: string;
  title: string;
  description: string;
  brand: string;
  productCondition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | string;
  size: string;
  color: string;
  price: number;
  categoryId: string;
  sellerId: string;
  isFeatured: boolean;
  featuredUntil: string | null;
  imageUrls: string[];
  createdAt?: string;
  isActive: boolean;
  categoryName: string;
  sellerUsername: string;
  sellerCreatedAt?: string;
  sellerTotalSales?: number;
  sellerRating?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}
