import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,RouterLink]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  showResendVerification = false;
  emailToVerify: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.showResendVerification = false;

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.message === 'Email not confirmed.') {
            this.showResendVerification = true;
            this.emailToVerify = this.loginForm.get('email')?.value;
          }
          this.error = error.message;
        }
      });
    }
  }

  resendVerification() {
    if (this.emailToVerify) {
      this.isLoading = true;
      this.error = null;

      this.authService.resendVerificationEmail(this.emailToVerify).subscribe({
        next: () => {
          this.error = 'تم إرسال رابط التحقق إلى بريدك الإلكتروني';
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }
}
