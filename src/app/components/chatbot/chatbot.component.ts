import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';
import { ToastrService } from 'ngx-toastr';
import { Nl2brPipe } from "../../pipes/nl2br.pipe";
import { LinkifyPipe } from "../../pipes/linkify.pipe";
import { BehaviorSubject } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, Nl2brPipe, LinkifyPipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  isChatOpen: boolean = false;
  isImageModalOpen: boolean = false;
  currentImageUrl: string = '';
  conversationId?: string;
  context: any = {};
  private readonly CHAT_STORAGE_KEY = 'ezz_chat_history';
  private readonly CHAT_OPEN_KEY = 'ezz_chat_open';
  private readonly STORAGE_KEY_CONTEXT = 'ezz_chatbot_context';
  private readonly STORAGE_KEY_CONVERSATION_ID = 'ezz_chatbot_conversation_id';

  constructor(
    private chatbotService: ChatbotService,
    private chatService: ChatService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Load chat history from local storage
    this.loadChatHistory();
    
    // If no messages, add welcome message
    if (this.messages.length === 0) {
      this.messages.push({
        content: 'مرحباً بك في إز ستور! 🌸 كيف يمكنني مساعدتك اليوم؟',
        isUser: false,
        timestamp: new Date()
      });
    }
    
    // Load chat open state
    const chatOpenState = localStorage.getItem(this.CHAT_OPEN_KEY);
    if (chatOpenState) {
      this.isChatOpen = JSON.parse(chatOpenState);
    }
    
    // Load conversation ID from local storage
    const savedConversationId = localStorage.getItem(this.STORAGE_KEY_CONVERSATION_ID);
    if (savedConversationId) {
      this.conversationId = savedConversationId;
    }

    // Load conversation context from local storage
    const savedContext = localStorage.getItem(this.STORAGE_KEY_CONTEXT);
    if (savedContext) {
      try {
        this.context = JSON.parse(savedContext);
      } catch (e) {
        console.error('Error loading conversation context:', e);
        this.context = {};
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    localStorage.setItem(this.CHAT_OPEN_KEY, JSON.stringify(this.isChatOpen));
    
    // إغلاق نافذة الصورة إذا كانت مفتوحة عند إغلاق الشات
    if (!this.isChatOpen && this.isImageModalOpen) {
      this.closeImageModal();
    }
  }
  
  // فتح نافذة الصورة المنبثقة
  openImageModal(imageUrl: string|undefined): void {
    this.currentImageUrl = imageUrl??'';
    this.isImageModalOpen = true;
    // منع التمرير في الصفحة عند فتح النافذة المنبثقة
    document.body.style.overflow = 'hidden';
  }
  
  // إغلاق نافذة الصورة المنبثقة
  closeImageModal(): void {
    this.isImageModalOpen = false;
    // إعادة تفعيل التمرير في الصفحة
    document.body.style.overflow = '';
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    // Extract metadata from message if needed
     const metadata = this.chatbotService.extractMetadata ? this.chatbotService.extractMetadata(this.currentMessage) : undefined;

    // Add user message
    this.messages.push({
      content: this.currentMessage,
      isUser: true,
      timestamp: new Date(),
      metadata: metadata
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    // If the user asks for forecasting, route to chat service forecasting endpoint
    const lower = userMessage.toLowerCase();
    const forecastKeywords = ['توقع', 'توقُّعات', 'توقُّعات', 'تنبؤ', 'الشهر القادم', 'القادم', 'المقبل'];
    const isForecast = forecastKeywords.some(k => lower.includes(k));

    if (isForecast) {
      this.chatService.forecastNextMonth(undefined, 5).subscribe({
        next: (res) => {
          const answer = res?.answer || 'لا تتوفر بيانات كافية للتوقع.';
          this.messages.push({ content: answer, isUser: false, timestamp: new Date() });
          this.isLoading = false;
          this.saveChatHistory();
        },
        error: (error) => {
          console.error('Forecast error:', error);
          this.messages.push({ content: 'تعذر توليد توقع الآن.', isUser: false, timestamp: new Date() });
          this.isLoading = false;
          this.saveChatHistory();
          this.toastr.error('فشل في التوقع', 'خطأ');
        }
      });
      return;
    }

    // Otherwise call RAG Chat endpoint with history
    this.chatbotService.sendMessage(userMessage, this.messages, undefined).subscribe({
      next: (res) => {
        const answer = res?.reply || 'تمت معالجة سؤالك.';
        this.messages.push({
          content: answer,
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.saveChatHistory();
      },
      error: (error) => {
        console.error('Chat error:', error);
        this.messages.push({
          content: 'عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.',
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.saveChatHistory();
        this.toastr.error('فشل في إرسال الرسالة', 'خطأ');
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  clearChat() {
    this.messages = [{
      content: 'مرحباً بك في إز ستور! 🌸 كيف يمكنني مساعدتك اليوم؟',
      isUser: false,
      timestamp: new Date()
    }];
    
    // Reset conversation ID and context
    this.conversationId = undefined;
    this.context = {};
    localStorage.removeItem(this.STORAGE_KEY_CONVERSATION_ID);
    localStorage.removeItem(this.STORAGE_KEY_CONTEXT);
    
    this.saveChatHistory();
  }
  
  private loadChatHistory() {
    const storedChat = localStorage.getItem(this.CHAT_STORAGE_KEY);
    if (storedChat) {
      try {
        const parsedChat = JSON.parse(storedChat);
        // Convert string timestamps back to Date objects
        this.messages = parsedChat.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing chat history:', error);
        // If error, start with empty chat
        this.messages = [];
      }
    }
  }
  
  private saveChatHistory() {
    localStorage.setItem(this.CHAT_STORAGE_KEY, JSON.stringify(this.messages));
  }

  suggestions: string[] = [
    'أخبرني المزيد عن خدماتكم في عز ستور',
    'كيف أبدأ في التسوق للعطور؟',
    'أظهر لي أحدث العروض على العود والمسك',
    'ما هي سياسة الإرجاع والاستبدال؟',
    'كم تستغرق عملية الشحن؟',
    'هل لديكم خدمة توصيل سريع؟',
    'ما هي طرق الدفع المتاحة؟',
    'هل تقدمون خصومات للطلبات الكبيرة؟'
  ];

  insertSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    // Auto-send the suggestion after a short delay
    setTimeout(() => this.sendMessage(), 300);
  }
}