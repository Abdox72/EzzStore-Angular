import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router';
interface Flower {
  id: number;
  x: number;
  y: number;
  delay: number;
}
@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('randomAppear', [
      // void => *  means “when item is inserted”
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'scale(0.3)'
        }),
        animate(
          '{{delay}}ms {{easing}}',
          style({
            opacity: 1,
            transform: 'scale(1)'
          })
        )
      ], {
        // default values if none passed
        params: {
          delay: 300,
          easing: 'ease-out'
        }
      })
    ])
  ]
})
export class HeroComponent {
  title = 'أجود أنواع العطور والعود';
  description = 'اكتشف مجموعة فريدة من العطور الفاخرة والعود الأصلي';
  ctaText = 'اكتشف المزيد';

  flowers: Flower[] = [];
  private readonly COUNT = 10;         // how many flowers
  private readonly HERO_WIDTH = 1200;  // adjust to your layout
  private readonly HERO_HEIGHT = 600;

  ngOnInit() {
    this.flowers = Array.from({ length: this.COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * (this.HERO_WIDTH - 100),   // leave margin
      y: Math.random() * (this.HERO_HEIGHT - 100),
      delay: 200 + Math.random() * 800             // between 200ms and 1000ms
    }));
  }
} 