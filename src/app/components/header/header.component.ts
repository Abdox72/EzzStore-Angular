import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  storeName = 'عز';
  navLinks = [
    { path: '/home', label: 'الرئيسية' , exact : true },
    { path: '/products', label: 'المنتجات' ,exact : false },
    { path: '/about', label: 'عن المتجر' , exact : true },
    { path: '/contact', label: 'اتصل بنا' , exact : true}
  ];
  isAuthenticated = false;
  isAdmin = false;
  sidebarOpen = false;
  totalItems =0;
  constructor(private authService:AuthService , private router:Router , private cartService:CartService ){
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  ngOnInit(): void {
      this.authService.authStatus$.subscribe(status => {
        this.isAuthenticated = status;
        if(status){
          this.navLinks =[
                { path: '/home', label: 'الرئيسية' , exact : true },
                { path: '/products', label: 'المنتجات' , exact : false },
                { path: '/orders', label: 'طلباتي' , exact : false },
                { path: '/about', label: 'عن المتجر' , exact : true },
                { path: '/contact', label: 'اتصل بنا' , exact : true }
              ]
        } else {
          this.navLinks =[
                { path: '/home', label: 'الرئيسية' , exact : true },
                { path: '/products', label: 'المنتجات' ,exact : false },
                { path: '/about', label: 'عن المتجر' , exact : true },
                { path: '/contact', label: 'اتصل بنا' , exact : true}
              ]
        }
      });
      this.authService.adminStatus$.subscribe(isAdmin => {
        this.isAdmin = isAdmin;
        if(isAdmin){
          this.navLinks =[
                { path: '/home', label: 'الرئيسية' , exact : true },
                { path: '/admin', label: 'الإدارة' , exact : false },
                { path: '/products', label: 'المنتجات' , exact : true },
                { path: '/orders', label: 'طلباتي' , exact : false },
                { path: '/about', label: 'عن المتجر' , exact : true }
              ]
        }
      });
      this.cartService.getTotalItems().subscribe(_totalItems => {
        this.totalItems = _totalItems;
      });
  }
  logout():void{
    this.authService.logout();
    this.navLinks = [
      { path: '/home', label: 'الرئيسية' , exact : true },
      { path: '/products', label: 'المنتجات' ,exact : false },
      { path: '/about', label: 'عن المتجر' , exact : true },
      { path: '/contact', label: 'اتصل بنا' , exact : true}
    ];
    this.router.navigate(['/']);
  }
}