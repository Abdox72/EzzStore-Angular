import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { FeaturedProductsComponent } from '../featured-products/featured-products.component';
import { CategoriesComponent } from '../categories/categories.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    FeaturedProductsComponent,
    CategoriesComponent,
  ],
  template: `
    <app-hero></app-hero>
    <app-featured-products></app-featured-products>
    <app-categories></app-categories>
  `
})
export class HomeComponent {} 