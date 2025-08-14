export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderFilterParameters extends PaginationParameters {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  customerName?: string;
  customerEmail?: string;
}

export interface ProductFilterParameters extends PaginationParameters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  inStock?: boolean;
}

export interface UserFilterParameters extends PaginationParameters {
  role?: string;
  emailConfirmed?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
} 