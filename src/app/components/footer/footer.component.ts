import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FooterComponent {
  socialLinks = [
    { icon: 'fab fa-facebook', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-twitter', url: '#' }
  ];
} 