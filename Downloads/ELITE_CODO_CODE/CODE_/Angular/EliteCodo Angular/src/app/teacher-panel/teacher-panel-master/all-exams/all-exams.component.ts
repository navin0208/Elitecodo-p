import { Component, inject } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface ExamResult {
  testId: number;
  examName: string;
  subject: string[];
  date: string;
  totalStudents: number;
  passPercentage: number;
  averageScore: number;
  highestScore: number;
  status: string | null;
}

@Component({
  selector: 'app-all-exams',
  templateUrl: './all-exams.component.html',
  styleUrls: ['./all-exams.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'translateY(20px)', opacity: 0 }),
          stagger(100, [
            animate('0.3s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AllExamsComponent {
  http = inject(HttpmethodsService);
  searchTerm: string = '';
  selectedSubject: string = '';
  selectedStatus: string = '';
  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  boardName = this.activateROut.snapshot.paramMap.get('name');

  examResults: ExamResult[] = [];
  filteredExams: ExamResult[] = [];

  constructor(private router: Router) { }

  ngOnInit() {
    this.getAllexams();
  }
  uniqueSubjects: string[] = [];
  getAllexams() {
    this.http.getRequest(`api/teacherReport/getTestReportByTeacher/${Number(sessionStorage.getItem('teacherId'))}`).subscribe(
      (response: any) => {
        console.log({ response });
        this.examResults = response.map((exam: any) => ({
          ...exam,
          subject: exam.subject.join(' , '),
          status: this.normalizeStatus(exam.status)
        }));
        this.filteredExams = [...this.examResults];
        // Extract unique subjects for dropdown
        this.uniqueSubjects = this.getUniqueSubjects(response);
      },
      (error) => {
        this.handleError(error);
      }
    );
  }
  // Helper method to extract unique subjects
  getUniqueSubjects(exams: any[]): string[] {
    const allSubjects = exams.flatMap(exam => exam.subject);
    return [...new Set(allSubjects)]; // This creates a unique array
  }
  // Helper method to normalize status
  normalizeStatus(status: string | null): string {
    if (!status) return 'Upcoming';
    switch (status.toLowerCase()) {
      case 'ended': return 'Completed';
      case 'ongoing': return 'Ongoing';
      default: return status;
    }
  }

  // Filter handling methods
  // Filtering method
  applyFilters(): void {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.filteredExams = this.examResults.filter(exam => {
      // Normalize subject to always be an array
      const subjects = Array.isArray(exam.subject) ? exam.subject : [exam.subject];

      // Search filter
      const matchesSearch = !this.searchTerm ||
        exam.examName.toLowerCase().includes(searchTermLower) ||
        subjects.some(sub => sub.toLowerCase().includes(searchTermLower));

      // Subject filter
      const matchesSubject = !this.selectedSubject ||
        subjects.includes(this.selectedSubject);

      // Status filter with proper null handling
      const examStatus = exam.status || 'Upcoming';
      const matchesStatus = !this.selectedStatus ||
        (this.selectedStatus === 'Completed' && examStatus === 'Completed') ||
        (this.selectedStatus === 'Upcoming' && examStatus === 'Upcoming') ||
        examStatus === this.selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });

    console.log('Filtered Exams:', this.filteredExams);
  }


  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSubject = '';
    this.selectedStatus = '';
    this.filteredExams = [...this.examResults];
  }

  // Navigation method
  viewExamDetails(examId: number): void {
    console.log({ examId });
    this.router.navigate([`/teacher/${this.boardName}/exam-detailed`, examId]);
  }

  // Statistics calculation methods
  getTotalStudents(): number {
    return this.examResults.reduce((sum, exam) => sum + exam.totalStudents, 0);
  }

  getAveragePassRate(): number {
    const completedExams = this.examResults.filter(exam => exam.status === 'Completed');
    if (completedExams.length === 0) return 0;

    const totalPassRate = completedExams.reduce((sum, exam) => sum + exam.passPercentage, 0);
    return Math.round(totalPassRate / completedExams.length);
  }

  getHighestScore(): number {
    return Math.max(...this.examResults
      .filter(exam => exam.status === 'Completed')
      .map(exam => exam.highestScore));
  }

  // Error handling method
  handleError(error: any): void {
    console.error('An error occurred:', error);
    // Implement error handling (e.g., showing a notification)
  }

  // Sorting methods
  sortByDate(ascending: boolean = true): void {
    this.filteredExams.sort((a, b) => {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return ascending ? comparison : -comparison;
    });
  }

  sortByPerformance(ascending: boolean = true): void {
    this.filteredExams.sort((a, b) => {
      const comparison = a.averageScore - b.averageScore;
      return ascending ? comparison : -comparison;
    });
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      'Completed': '#20bf6b',
      'Ongoing': '#fa8231',
      'Upcoming': '#45aaf2'
    } as { [key: string]: string };
    return colors[status] || '#7f8c8d';
  }
}