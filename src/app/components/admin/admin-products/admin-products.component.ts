import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product, Category } from '../../../interfaces/product';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

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
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedProduct: Product | null = null;
  selectedFiles: File[] = [];

  isModalOpen = false;
  productForm: FormGroup;
  imagePreview: string | null = null;
  staticFiles:string = environment.staticFiles;

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
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filterProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.categoryId == this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
    if (this.filteredProducts.length === 0) {
      this.toastr.info('لم يتم العثور على منتجات تطابق معايير البحث', 'نتيجة البحث');
    }
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