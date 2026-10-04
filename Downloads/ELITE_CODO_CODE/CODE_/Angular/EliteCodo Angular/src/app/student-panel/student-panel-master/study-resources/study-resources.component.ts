import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

// Updated interfaces to match API response
interface Content {
  id: number;
  url: string;
  type: string;
  title: string;
  description: string;
}

interface Topic {
  id: number;
  name: string;
  content: Content[];
}

interface Chapter {
  id: number;
  name: string;
  icon: string | null;
  topics: Topic[];
  content: Content[];
}

interface Subject {
  id: number;
  name: string;
  icon: string | null;
  chapters: Chapter[];
}
interface Standard {
  id: number;
  name: string;
}
interface ApiResponse {
  subjects: Subject[];
}

@Component({
  selector: 'app-study-resources',
  templateUrl: './study-resources.component.html',
  styleUrls: ['./study-resources.component.scss']
})
export class StudyResourcesComponent implements OnInit {
  // Services
  http = inject(HttpmethodsService);

  // Signals
  // Signals
  contentLoading = signal(false);

  standards = signal<Standard[]>([]); // Signal for standards
  subjects = signal<Subject[]>([]);
  searchQuery = signal('');
  selectedSubject = signal<Subject | null>(null);
  selectedChapter = signal<Chapter | null>(null);
  selectedTopic = signal<Topic | null>(null);
  selectedContent = signal<Content | null>(null);
  isSidebarOpen = signal(false);
  isMobile = signal(window.innerWidth <= 768);
  isLoading = signal(true);
  // Selected standard ID
  selectedStandardId: number | null = null;


  // Computed values
  filteredSubjects = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const currentSubjects = this.subjects();

    if (!currentSubjects) return [];

    return currentSubjects.filter(subject =>
      subject.name.toLowerCase().includes(query) ||
      subject.chapters?.some(chapter =>
        chapter.name.toLowerCase().includes(query)
      )
    );
  });

  constructor(public sanitizer: DomSanitizer) {
    // Mobile responsiveness
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth <= 768);
      if (!this.isMobile()) {
        this.isSidebarOpen.set(true);
      }
    });
  }

  ngOnInit() {
    this.isSidebarOpen.set(!this.isMobile());

    // Clear existing data
    this.subjects.set([]);
    this.selectedSubject.set(null);
    this.selectedChapter.set(null);
    this.selectedTopic.set(null);
    this.selectedContent.set(null);

    const studentId = Number(sessionStorage.getItem('studentId'));
    this.fetchStandards(studentId);
  }

  // Add this method to your component
  fetchStandards(studentId: number): void {
    this.http.getRequest(`api/auth/getStandard/${studentId}`).subscribe(
      (response: any) => {
        if (response) {
          this.standards.set(response);
          // Auto-select the first standard if available
          if (response.length > 0) {
            console.log('data of standard', response[0].id);

            this.selectedStandardId = response[0].id;

            this.fetchSubjects();
          }
        } else {
          console.error('Invalid response format:', response);
          this.standards.set([]);
        }
      },
      (error) => {
        console.error('Error fetching standards:', error);
        this.standards.set([]);
      }
    );
  }

  fetchSubjects(): void {
    this.isLoading.set(true);

    // Reset selections when fetching new subjects
    this.selectedSubject.set(null);
    this.selectedChapter.set(null);
    this.selectedTopic.set(null);
    this.selectedContent.set(null);

    const entranceExamId = sessionStorage.getItem('entranceExamIdOfStudent');
    const studentId = sessionStorage.getItem('studentId');

    if (!this.selectedStandardId || !entranceExamId || !studentId) {
      console.error('Missing required parameters for fetchSubjects');
      this.isLoading.set(false);
      this.subjects.set([]);
      return;
    }

    this.http.getRequest(`api/uploadcontent/allmappeduploadcontents/${entranceExamId}/${this.selectedStandardId}/${studentId}`)
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response?.subjects && Array.isArray(response.subjects)) {
            console.log('Subjects loaded:', response.subjects);
            this.subjects.set(response.subjects);

            // Auto-select first subject if available
            if (response.subjects.length > 0) {
              this.selectSubject(response.subjects[0]);
            }
          } else {
            console.error('Invalid response format or empty subjects:', response);
            this.subjects.set([]);
          }
        },
        error: (error) => {
          console.error('Error fetching subjects:', error);
          this.isLoading.set(false);
          this.subjects.set([]);
        }
      });
  }


  onStandardChange(standardId: number): void {
    if (this.selectedStandardId === standardId) {
      return; // Avoid unnecessary reloading if same standard selected
    }

    this.selectedStandardId = standardId;
    this.fetchSubjects();
  }

  selectSubject(subject: Subject) {
    console.log('Selecting subject:', subject);
    this.selectedSubject.set(subject);
    this.selectedChapter.set(null);
    this.selectedTopic.set(null);
    this.selectedContent.set(null);

    // Auto-select first chapter if available
    if (subject.chapters && subject.chapters.length > 0) {
      this.selectChapter(subject.chapters[0]);
    }

    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  selectChapter(chapter: Chapter) {
    console.log('Selecting chapter:', chapter);
    this.selectedChapter.set(chapter);
    this.selectedTopic.set(null);

    // Auto-select first content if available
    if (chapter.content && chapter.content.length > 0) {
      this.selectedContent.set(chapter.content[0]);
    } else {
      this.selectedContent.set(null);
    }

    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  selectTopic(topic: Topic) {
    console.log('Selecting topic:', topic);
    this.selectedTopic.set(topic);

    // Auto-select first content if available
    if (topic.content && topic.content.length > 0) {
      this.selectedContent.set(topic.content[0]);
    } else {
      this.selectedContent.set(null);
    }

    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  selectContent(content: Content) {
    console.log('Selecting content:', content);
    this.contentLoading.set(true);
    this.selectedContent.set(content);

    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }

    // Reset loading state after content loads or times out
    setTimeout(() => {
      this.contentLoading.set(false);
    }, 2000); // Adjust timeout as needed
  }


  getAvailableContent(): Content[] {
    if (this.selectedTopic()) {
      return this.selectedTopic()!.content || [];
    } else if (this.selectedChapter()?.content) {
      return this.selectedChapter()!.content || [];
    }
    return [];
  }

  getFileViewer(content: Content): 'pdf' | 'video' | 'docs' | 'other' {
    const type = content.type.toLowerCase();
    const extension = content.url.split('.').pop()?.toLowerCase();

    // Check for video types
    if (type === 'video' || ['mp4', 'mov', 'avi'].includes(extension || '')) {
      return 'video';
    }

    if (type === 'pdf') return 'pdf';
    if (['docs', 'docx', 'txt', 'xls', 'xlsx'].includes(type)) {
      return 'docs';
    }
    return 'other';
  }

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  getGoogleDocsViewerUrl(url: string): string {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  getVideoType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const validVideoTypes = ['mp4', 'mov', 'avi'];

    if (!extension || !validVideoTypes.includes(extension)) {
      return 'mp4'; // default fallback
    }

    return extension;
  }
  getContentIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'video':
        return 'fa-video';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';
      default:
        return 'fa-file-alt';
    }
  }

  downloadContent(content: Content) {
    const link = document.createElement('a');
    link.href = content.url;
    link.download = content.title || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}