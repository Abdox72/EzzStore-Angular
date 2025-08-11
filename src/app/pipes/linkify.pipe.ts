import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  standalone: true
})
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return text;

    // URL pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    // Product pattern (example: #product:123)
    const productPattern = /#product:(\d+)/g;
    
    // Category pattern (example: #category:456)
    const categoryPattern = /#category:(\d+)/g;

    // Replace URLs with anchor tags
    let transformedText = text.replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Replace product references with links
    transformedText = transformedText.replace(productPattern, (match, productId) => {
      return `<a href="/product/${productId}" class="chatbot-product-link">عرض المنتج</a>`;
    });

    // Replace category references with links
    transformedText = transformedText.replace(categoryPattern, (match, categoryId) => {
      return `<a href="/category/${categoryId}" class="chatbot-category-link">تصفح الفئة</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(transformedText);
  }
}