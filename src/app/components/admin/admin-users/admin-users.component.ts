import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user';

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
    this.openModal(user);
  }

  deleteUser(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      if (this.selectedUser) {
        this.userService.updateUser(this.selectedUser.id, userData).subscribe(() => {
          this.loadUsers();
          this.closeModal();
        });
      } else {
        this.userService.createUser(userData).subscribe(() => {
          this.loadUsers();
          this.closeModal();
        });
      }
    }
  }
}