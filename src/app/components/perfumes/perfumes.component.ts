import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfumes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfumes.component.html',
  styleUrls: ['./perfumes.component.css']
})
export class PerfumesComponent {
  perfumeProducts = [
    {
      id: 1,
      name: 'عطر رجالي',
      price: 800,
      image: '/assets/images/عطور.jpg'
    },
    {
      id: 2,
      name: 'عطر نسائي',
      price: 900,
      image: '/assets/images/عطور.jpg'
    },
    {
      id: 3,
      name: 'عطر ملكي',
      price: 1200,
      image: '/assets/images/عطور.jpg'
    }
  ];
}