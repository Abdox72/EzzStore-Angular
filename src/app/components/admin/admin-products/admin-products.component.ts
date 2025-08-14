import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product, Category } from '../../../interfaces/product';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, ProductFilterParameters } from '../../../interfaces/pagination';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  // Make Math available in template
  Math = Math;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Filter properties
  searchTerm = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minStock: number | null = null;
  maxStock: number | null = null;
  inStock: boolean | null = null;
  sortBy = '';
  sortDescending = false;

  selectedProduct: Product | null = null;
  selectedFiles: File[] = [];

  isModalOpen = false;
  productForm: FormGroup;
  imagePreview: string | null = null;
  staticFiles: string = environment.staticFiles;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    const filterParams: ProductFilterParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      minStock: this.minStock || undefined,
      maxStock: this.maxStock || undefined,
      inStock: this.inStock !== null ? this.inStock : undefined
    };

    this.productService.getPaginatedProducts(filterParams).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response.data;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.hasNextPage = response.hasNextPage;
        this.hasPreviousPage = response.hasPreviousPage;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل في تحميل المنتجات';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.currentPage = 1;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.minStock = null;
    this.maxStock = null;
    this.inStock = null;
    this.sortBy = '';
    this.sortDescending = false;
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(field: string): void {
    if (this.sortBy === field) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortBy = field;
      this.sortDescending = false;
    }
    this.loadProducts();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return '↕️';
    return this.sortDescending ? '↓' : '↑';
  }

  // Pagination helper methods
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  openModal(product?: Product): void {
    this.isModalOpen = true;
    if (product) {
      this.selectedProduct = product;
      this.productForm.patchValue({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId
      });
      if (product.images && product.images.length > 0) {
        this.imagePreview = product.images[0].imageUrl;
      }
    } else {
      this.resetForm();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.selectedProduct = null;
    this.productForm.reset();
    this.imagePreview = null;
  }

  editProduct(product: Product): void {
    this.openModal(product);
  }

  deleteProduct(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('تم حذف المنتج بنجاح', 'تم الحذف');
          this.loadProducts();
        },
        error: (error) => {
          this.toastr.error('حدث خطأ أثناء حذف المنتج', 'خطأ');
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  onImageChange(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedFiles = Array.from(files);
  
      // For preview, just show the first image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(files[0]);
    }
  }
  
  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.value[key]);
      });
  
      // Append multiple image files
      for (const file of this.selectedFiles) {
        formData.append('images', file);
      }
  
      const request$ = this.selectedProduct
        ? this.productService.updateProduct(this.selectedProduct.id, formData)
        : this.productService.createProduct(formData);
  
      request$.subscribe({
        next: () => {
          this.toastr.success('تم تحديث المنتج بنجاح', 'تم التحديث');
          this.closeModal();
          this.loadProducts();
        },
        error: (error) => {
          this.toastr.error('حدث خطأ أثناء تحديث المنتج', 'خطأ');
          console.error('Error updating product:', error);
        }
      });
    }
  }
}