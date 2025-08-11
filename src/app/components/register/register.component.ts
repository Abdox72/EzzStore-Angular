import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  errorMessage: string = '';
  errorMessages: string[] = [];

  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage = '';
    this.errorMessages = [];
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }
    if (!this.user.email.includes('@')) {
      this.errorMessage = 'Invalid email format';
      return;
    }
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const { confirmPassword, ...registerData } = this.user;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.handleErrorResponse(error);
      }
    });
  }

  private handleErrorResponse(error: any) {
    // const backendError = error?.error;
    if (error) {
      this.errorMessage = error.message;
    }
    if (!error) {
      this.errorMessage = 'An unknown error occurred.';
      return;
    }
    if (typeof error === 'string') {
      this.errorMessage = error;
    } else if (Array.isArray(error)) {
      this.errorMessage = error.map(e => e.description || e.code).join(', ');
    } else if (typeof error === 'object') {
      const messages: string[] = [];
      for (const key in error) {
        if (Array.isArray(error[key])) {
          messages.push(...error[key]);
        }
      }
      this.errorMessages =messages;
    } else {
      this.errorMessage = 'An unexpected error occurred.';
    }
  }
}
