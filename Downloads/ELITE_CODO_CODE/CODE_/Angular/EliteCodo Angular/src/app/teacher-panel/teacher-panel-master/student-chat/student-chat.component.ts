import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface User {
  id: string;
  username: string;
  type: 'student' | 'teacher';
  profileImage: string;
}

interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
}
@Component({
  selector: 'app-student-chat',
  templateUrl: './student-chat.component.html',
  styleUrls: ['./student-chat.component.css']
})
export class StudentChatComponent implements OnInit {
  currentUser!: User;
  users: User[] = [];
  conversations: Conversation[] = [];
  selectedUser: User | null = null;
  selectedConversation: Conversation | null = null;
  searchTerm: string = '';
  messageForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeUsers();
    this.initializeConversations();
    this.initMessageForm();
  }

  initializeUsers(): void {
    this.currentUser = {
      id: 'current-teacher',
      username: 'Mr. Johnson',
      type: 'teacher',
      profileImage: 'path/to/teacher/avatar'
    };

    this.users = [
      {
        id: 'student1',
        username: 'Alice Smith',
        type: 'student',
        profileImage: 'path/to/student/avatar1'
      },
      {
        id: 'student2',
        username: 'Bob Williams',
        type: 'student',
        profileImage: 'path/to/student/avatar2'
      }
    ];
  }

  initializeConversations(): void {
    this.conversations = this.users.map(user => ({
      id: `conversation-${user.id}`,
      participants: [this.currentUser, user],
      messages: []
    }));
  }

  initMessageForm(): void {
    this.messageForm = this.fb.group({
      messageContent: ['', Validators.required]
    });
  }

  selectConversation(user: User): void {
    this.selectedUser = user;
    this.selectedConversation = this.conversations
      .find(conv => conv.participants.some(p => p.id === user.id))!;
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedConversation) {
      const newMessage: Message = {
        id: this.generateUniqueId(),
        sender: this.currentUser,
        content: this.messageForm.value.messageContent,
        timestamp: new Date(),
        read: false
      };

      this.selectedConversation.messages.push(newMessage);
      this.messageForm.reset();
    }
  }

  getUnreadCount(user: User): number {
    const conversation = this.conversations
      .find(conv => conv.participants.some(p => p.id === user.id));
    return conversation
      ? conversation.messages.filter(m => !m.read).length
      : 0;
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
