import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class EmailVerificationComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userId: string = '';
  token: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];
      console.log(this.token)
      if (!this.userId || !this.token) {
        this.errorMessage = 'رابط التحقق غير صالح';
        return;
      }

      this.verifyEmail();
    });
  }

  verifyEmail() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyEmail(this.userId, this.token).subscribe({
      next: () => {
        this.successMessage = 'تم تأكيد بريدك الإلكتروني بنجاح';
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'حدث خطأ أثناء تأكيد البريد الإلكتروني';
        this.isLoading = false;
      }
    });
  }
} 