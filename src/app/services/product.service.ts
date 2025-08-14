import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../interfaces/product';
import { environment } from '../../environments/environment';
import { PaginatedResponse, ProductFilterParameters } from '../interfaces/pagination';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoriesUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // Product methods
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getPaginatedProducts(filterParams: ProductFilterParameters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('pageNumber', filterParams.pageNumber.toString())
      .set('pageSize', filterParams.pageSize.toString());

    if (filterParams.searchTerm) {
      params = params.set('searchTerm', filterParams.searchTerm);
    }
    if (filterParams.sortBy) {
      params = params.set('sortBy', filterParams.sortBy);
    }
    if (filterParams.sortDescending !== undefined) {
      params = params.set('sortDescending', filterParams.sortDescending.toString());
    }
    if (filterParams.categoryId) {
      params = params.set('categoryId', filterParams.categoryId.toString());
    }
    if (filterParams.minPrice) {
      params = params.set('minPrice', filterParams.minPrice.toString());
    }
    if (filterParams.maxPrice) {
      params = params.set('maxPrice', filterParams.maxPrice.toString());
    }
    if (filterParams.minStock) {
      params = params.set('minStock', filterParams.minStock.toString());
    }
    if (filterParams.maxStock) {
      params = params.set('maxStock', filterParams.maxStock.toString());
    }
    if (filterParams.inStock !== undefined) {
      params = params.set('inStock', filterParams.inStock.toString());
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/paginated`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
  
  updateProduct(id: number, product: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }
  

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Category methods
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesUrl}/${id}`);
  }


  createCategory(category: FormData): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category);
  }
  
  updateCategory(id: number, category: FormData): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }
}
