import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, Category } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  searchTerm: string = '';
  selectedCategories: number[] = [];
  minPrice: number = 0;
  maxPrice: number = 1000;
  priceRange: number = this.maxPrice;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      
      // Get unique categories by ID
      const uniqueCategories = new Map<number, Category>();
      data.forEach(product => {
        if (product.category && !uniqueCategories.has(product.category.id)) {
          uniqueCategories.set(product.category.id, product.category);
        }
      });
      this.categories = Array.from(uniqueCategories.values());
      
      // Set initial price range based on products
      this.minPrice = Math.min(...data.map(p => p.price));
      this.maxPrice = Math.max(...data.map(p => p.price));
      this.priceRange = this.maxPrice;
      this.filterProducts();
    });
  }

  toggleCategory(categoryId: number) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index === -1) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.selectedCategories.length === 0 || 
                            this.selectedCategories.includes(product.categoryId);
      const matchesSearch = this.searchTerm
        ? product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      const matchesPrice = product.price <= this.priceRange;
      return matchesCategory && matchesSearch && matchesPrice;
    });
    if (this.filteredProducts.length === 0) {
      this.toastr.info('لم يتم العثور على منتجات تطابق معايير البحث', 'نتيجة البحث');
    }
  }

  addToCart(product: Product) {
    this.cartService.addItem({ product, quantity: 1 });
    this.toastr.success('تمت إضافة المنتج إلى السلة', 'تم الإضافة');
  }

  getProductImage(product: Product): string {
    return product.images?.[0]?.imageUrl || '/assets/images/placeholder.jpg';
  }
}