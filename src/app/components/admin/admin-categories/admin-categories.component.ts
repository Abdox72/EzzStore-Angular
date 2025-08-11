import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Category } from '../../../interfaces/product';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm = '';
  selectedCategory: Category | null = null;
  isModalOpen = false;
  categoryForm: FormGroup;
  selectedFile: File | null = null;

  imagePreview: string | null = null;
  staticFiles:string = environment.staticFiles;


  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.filterCategories();
    });
  }

  filterCategories(): void {
    this.filteredCategories = this.categories.filter(category => {
      return category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  openModal(category?: Category): void {
    this.isModalOpen = true;
    if (category) {
      this.selectedCategory = category;
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description
      });
      if (category.image) {
        this.imagePreview = category.image;
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
    this.selectedCategory = null;
    this.categoryForm.reset();
  }

  editCategory(category: Category): void {
    this.openModal(category);
  }

  deleteCategory(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      this.productService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formData = new FormData();
      formData.append('name', this.categoryForm.get('name')?.value);
      formData.append('description', this.categoryForm.get('description')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      const request$ = this.selectedCategory
        ? this.productService.updateCategory(this.selectedCategory.id, formData)
        : this.productService.createCategory(formData);
  
      request$.subscribe(() => {
        this.loadCategories();
        this.closeModal();
      });

      }
    }
    onImageUpload(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
        }
    }

  }