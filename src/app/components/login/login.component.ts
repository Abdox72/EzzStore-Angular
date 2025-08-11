import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatIconModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  showResendVerification = false;
  emailToVerify: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Check if we're returning from Google OAuth
    this.checkGoogleAuthResponse();
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

  onGoogleLogin() {
    try {
      this.isLoading = true;
      this.error = null;

      // Store the current URL to return to after OAuth
      localStorage.setItem('googleAuthReturnUrl', window.location.href);

      // Google OAuth configuration
      const googleConfig = {
        client_id: environment.google.clientId,
        scope: 'email profile',
        response_type: 'id_token',
        redirect_uri: `${window.location.origin}/login`,
        nonce: Math.random().toString(36).substring(2, 15)
      };

      // Store nonce for verification
      localStorage.setItem('googleAuthNonce', googleConfig.nonce);

      // Create Google OAuth URL
      const params = new URLSearchParams({
        client_id: googleConfig.client_id,
        scope: googleConfig.scope,
        response_type: googleConfig.response_type,
        redirect_uri: googleConfig.redirect_uri,
        nonce: googleConfig.nonce,
        state: btoa(JSON.stringify({ returnUrl: window.location.href }))
      });

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error: any) {
      this.error = error.message || 'Google login failed';
      this.toastr.error(this.error || 'Google login failed');
      this.isLoading = false;
    }
  }

  private checkGoogleAuthResponse() {
    // Helper that reads a param from either query string or fragment
    const getParam = (name: string) => {
      // query string ?a=1&b=2
      const qs = new URLSearchParams(window.location.search);
      if (qs.has(name)) return qs.get(name);
  
      // fragment #a=1&b=2  (remove leading '#')
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const hs = new URLSearchParams(hash.replace(/^#/, ''));
      return hs.get(name);
    };
  
    const idToken = getParam('id_token');
    const error = getParam('error');
    const state = getParam('state');
  
    if (idToken) {
      this.handleGoogleAuthSuccess(idToken, state);
    } else if (error) {
      this.handleGoogleAuthError(error);
    }
  }
  

  private handleGoogleAuthSuccess(idToken: string, state: string | null) {
    try {
      const storedNonce = localStorage.getItem('googleAuthNonce');
      if (!storedNonce) throw new Error('Invalid authentication state');
  
      const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
  
      if (tokenPayload.nonce !== storedNonce) {
        throw new Error('Invalid authentication token');
      }
  
      // Clear nonce and return url
      localStorage.removeItem('googleAuthNonce');
      localStorage.removeItem('googleAuthReturnUrl');
  
      // remove fragment/search from url so user doesn't see token and we don't reprocess it
      // history.replaceState(null, '', location.pathname + location.search);
  
      // Send idToken to backend for verification/sign-in
      const googleLoginData = {
        idToken,
        email: tokenPayload.email,
        name: tokenPayload.name,
        photoUrl: tokenPayload.picture
      };
  
      this.authService.googleLogin(googleLoginData).subscribe({
        next: () => {
          this.toastr.success('Google login successful!');
          const returnUrl = state ? JSON.parse(atob(state)).returnUrl : '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.error = err?.message || 'Google login failed';
          this.toastr.error(this.error || 'Google login failed');
        }
      });
  
    } catch (err: any) {
      this.error = err.message || 'Google authentication failed';
      this.toastr.error(this.error || 'Google authentication failed');
    } finally {
      this.isLoading = false;
    }
  }
  

  private handleGoogleAuthError(error: string) {
    this.error = `Google authentication failed: ${error}`;
    this.toastr.error(this.error);
    this.isLoading = false;
    
    // Clear stored data
    localStorage.removeItem('googleAuthNonce');
    localStorage.removeItem('googleAuthReturnUrl');
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
