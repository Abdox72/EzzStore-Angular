import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminLayoutComponent implements OnInit {
  navItems = [
    { path: '/admin/dashboard', label: 'لوحة التحكم', icon: 'dashboard' },
    { path: '/admin/products', label: 'المنتجات', icon: 'inventory' },
    { path: '/admin/categories', label: 'التصنيفات', icon: 'category' },
    { path: '/admin/users', label: 'المستخدمين', icon: 'people' },
    { path: '/admin/contact-messages', label: 'المراسلات', icon: 'contacts' },
    { path: '/admin/orders', label: 'الطلبات', icon: 'shopping_cart' },
  ];

  currentRoute = '';
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isSearchExpanded = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit() {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  expandSearch() {
    this.isSearchExpanded = true;
  }

  collapseSearch() {
    this.isSearchExpanded = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close user menu when clicking outside
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 