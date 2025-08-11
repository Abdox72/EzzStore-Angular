import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, AddUserDto } from '../../../services/user.service';
import { User } from '../../../interfaces/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedUser: User | null = null;
  isModalOpen = false;
  userForm: FormGroup;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      password: ['' , [Validators.required , Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      return (user?.name ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              (user?.email?? '' ).toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  openModal(user?: User): void {
    this.isModalOpen = true;
    if (user) {
      this.selectedUser = user;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      this.resetForm();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.selectedUser = null;
    this.userForm.reset({
      role: 'user'
    });
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase()
    });
    // عند تعديل المستخدم، لا نحتاج لكلمة المرور لأننا سنقوم فقط بتعديل الدور
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  deleteUser(id: string): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف المستخدم بنجاح';
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'حدث خطأ أثناء حذف المستخدم';
          console.error('Error deleting user:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      
      if (this.selectedUser) {
        // إذا كان هناك مستخدم محدد، فنحن نقوم بتعديل الدور فقط
        const role = this.userForm.get('role')?.value;
        this.userService.updateUserRole(this.selectedUser.id.toString(), role).subscribe({
          next: () => {
            this.successMessage = 'تم تحديث دور المستخدم بنجاح';
            this.loadUsers();
            this.closeModal();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error: HttpErrorResponse) => {
            this.errorMessage = 'حدث خطأ أثناء تحديث دور المستخدم';
            console.error('Error updating user role:', error);
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
      } else {
        // إذا لم يكن هناك مستخدم محدد، فنحن نقوم بإنشاء مستخدم جديد
        const userData: AddUserDto = {
          name: this.userForm.get('name')?.value,
          email: this.userForm.get('email')?.value,
          role: this.userForm.get('role')?.value,
          password: this.userForm.get('password')?.value
        };
        
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.successMessage = 'تم إضافة المستخدم بنجاح';
            this.loadUsers();
            this.closeModal();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error: HttpErrorResponse) => {
            if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'حدث خطأ أثناء إضافة المستخدم';
            }
            console.error('Error creating user:', error);
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    }
  }
}