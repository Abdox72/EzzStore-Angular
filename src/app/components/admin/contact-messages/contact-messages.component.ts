import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../services/contact.service';
import { ContactFormData } from '../../../interfaces/contactFormData';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-messages',
  templateUrl: './contact-messages.component.html',
  styleUrls: ['./contact-messages.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ContactMessagesComponent implements OnInit {
  messages: ContactFormData[] = [];
  isLoading = false;
  error: string | null = null;
  deletingId: number | null = null;

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMessages();
  }

  loadMessages() {
    this.isLoading = true;
    this.error = null;

    this.contactService.getAllContacts().subscribe({
      next: (response) => {
        this.messages = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.error = 'لا يوجد اي رسائل';
        this.isLoading = false;
      }
    });
  }

  deleteMessage(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      this.deletingId = id;
      
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.messages = this.messages.filter(message => message.id !== id);
          this.deletingId = null;
        },
        error: (error) => {
          console.error('Error deleting message:', error);
          this.error = 'حدث خطأ أثناء حذف الرسالة';
          this.deletingId = null;
        }
      });
    }
  }
} 