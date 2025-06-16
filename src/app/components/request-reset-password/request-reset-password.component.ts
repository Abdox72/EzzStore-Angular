import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './request-reset-password.component.html',
  styleUrls: ['./request-reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,RouterLink]
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  requestForm: FormGroup;
  isRequesting = false;
  isResetting = false;
  error: string | null = null;
  success: string | null = null;
  showRequestForm = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // Check if we have a token in the URL
    this.route.queryParams.subscribe(params => {
      if (params['token'] && params['email']) {
        this.showRequestForm = false;
        this.resetForm.patchValue({
          email: params['email'],
          token: params['token']
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  requestReset() {
    if (this.requestForm.valid) {
      this.isRequesting = true;
      this.error = null;
      this.success = null;

      this.authService.requestPasswordReset(this.requestForm.value.email)
        .subscribe({
          next: () => {
            this.success = 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
            this.isRequesting = false;
          },
          error: (error) => {
            this.error = error.message;
            this.isRequesting = false;
          }
        });
    }
  }

  resetPassword() {
    if (this.resetForm.valid) {
      this.isResetting = true;
      this.error = null;
      this.success = null;

      const { email, token, newPassword } = this.resetForm.value;

      this.authService.resetPassword(email, token, newPassword)
        .subscribe({
          next: () => {
            this.success = 'تم إعادة تعيين كلمة المرور بنجاح';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            this.error = error.message;
            this.isResetting = false;
          }
        });
    }
  }
} 