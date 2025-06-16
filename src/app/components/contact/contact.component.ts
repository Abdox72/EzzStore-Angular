import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ContactFormData } from '../../interfaces/contactFormData';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent {
  contactImage = '/assets/images/contactus.jpg';
  contactForm: FormGroup;
  isSubmitting = false;
  submitStatus: 'idle' | 'success' | 'error' = 'idle';
  submitMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private authService:AuthService,
    private router:Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      if(!this.authService.isAuthenticated()){
        this.router.navigate(['/login']);
        return;
      }
      this.isSubmitting = true;
      this.submitStatus = 'idle';
      
      const formData: ContactFormData = this.contactForm.value;
      
      this.contactService.submitContactForm(formData)
        .pipe(
          catchError(error => {
            console.error('Error submitting form:', error);
            this.submitStatus = 'error';
            this.submitMessage = 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.';
            return of(null);
          }),
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe(response => {
          if (response) {
            this.submitStatus = 'success';
            this.submitMessage = 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.';
            this.contactForm.reset();
            
            // Reset status after 5 seconds
            setTimeout(() => {
              this.submitStatus = 'idle';
              this.submitMessage = '';
            }, 4000);
          }
        });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.hasError('required')) {
      return 'هذا الحقل مطلوب';
    }
    if (control?.hasError('email')) {
      return 'البريد الإلكتروني غير صالح';
    }
    if (control?.hasError('minlength')) {
      return `يجب أن يحتوي على ${control.errors?.['minlength'].requiredLength} أحرف على الأقل`;
    }
    return '';
  }
} 