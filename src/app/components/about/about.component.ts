import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AboutComponent {
  title = 'عن متجر عز';
  description = 'نقدم لكم أجود أنواع العطور والعود والمسك من أفضل المصادر العالمية. نحن نختار منتجاتنا بعناية فائقة لنضمن لكم تجربة فريدة من نوعها.';
  aboutImage = '/assets/images/img1.png';
} 