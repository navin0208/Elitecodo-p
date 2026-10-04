// draft.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface Draft {
  id: string;
  type: 'broadcast' | 'individual';
  subject: string;
  message: string;
  recipients?: any[];
  createdAt: string | Date;  // Changed type to allow both string and Date
  lastModified: string | Date;  // Changed type to allow both string and Date
}

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private drafts = new BehaviorSubject<Draft[]>([]);

  constructor(private messageService: NzMessageService) {
    this.loadDrafts();
  }

  private loadDrafts(): void {
    try {
      const savedDrafts = localStorage.getItem('messageDrafts');
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts);
        // Convert string dates back to Date objects
        const draftsWithDates = parsedDrafts.map((draft: Draft) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          lastModified: new Date(draft.lastModified)
        }));
        this.drafts.next(draftsWithDates);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      this.drafts.next([]);
    }
  }

  private saveDraftsToStorage(drafts: Draft[]): void {
    try {
      localStorage.setItem('messageDrafts', JSON.stringify(drafts));
      this.drafts.next(drafts);
    } catch (error) {
      console.error('Error saving drafts:', error);
      this.messageService.error('Error saving draft. Please try again.');
    }
  }

  getDrafts(): Observable<Draft[]> {
    return this.drafts.asObservable();
  }

  saveDraft(draft: Partial<Draft>): void {
    try {
      const currentDrafts = this.drafts.value;
      const now = new Date();
      const newDraft: Draft = {
        id: this.generateId(),
        type: draft.type || 'broadcast',
        subject: draft.subject || '',
        message: draft.message || '',
        recipients: draft.recipients || [],
        createdAt: now,
        lastModified: now
      };

      this.saveDraftsToStorage([...currentDrafts, newDraft]);
      this.messageService.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error in saveDraft:', error);
      this.messageService.error('Error saving draft. Please try again.');
    }
  }

  updateDraft(id: string, updates: Partial<Draft>): void {
    try {
      const currentDrafts = this.drafts.value;
      const draftIndex = currentDrafts.findIndex(d => d.id === id);

      if (draftIndex !== -1) {
        const updatedDraft = {
          ...currentDrafts[draftIndex],
          ...updates,
          lastModified: new Date()
        };

        currentDrafts[draftIndex] = updatedDraft;
        this.saveDraftsToStorage(currentDrafts);
        this.messageService.success('Draft updated successfully!');
      }
    } catch (error) {
      console.error('Error in updateDraft:', error);
      this.messageService.error('Error updating draft. Please try again.');
    }
  }

  deleteDraft(id: string): void {
    try {
      const currentDrafts = this.drafts.value;
      const filteredDrafts = currentDrafts.filter(d => d.id !== id);
      this.saveDraftsToStorage(filteredDrafts);
      this.messageService.success('Draft deleted successfully!');
    } catch (error) {
      console.error('Error in deleteDraft:', error);
      this.messageService.error('Error deleting draft. Please try again.');
    }
  }

  private generateId(): string {
    return 'draft_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
  }
}