import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface Exam {
  id: number;
  name: string;
  subjects: string[];
  date: Date;
  totalMarks: number;
  status: 'upcoming' | 'completed' | 'ongoing';
  endTime: string;
}

@Component({
  selector: 'app-all-offline-test',
  templateUrl: './all-offline-test.component.html',
  styleUrls: ['./all-offline-test.component.scss']
})
export class AllOfflineTestComponent implements OnInit {
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  searchText = '';
  statusFilter = '';
  loading = false;
  errorMessage: string | null = null;
  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  http = inject(HttpmethodsService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.getOfflineExams();
  }

  getOfflineExams() {
    this.loading = true;
    this.errorMessage = null;
    this.http.getRequest(`api/test/getOfflineById/${sessionStorage.getItem('teacherId')}`).subscribe(
      (response: any) => {
        this.exams = response.map(this.determineExamStatus);
        this.filterExams();
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load exams. Please try again later.';
        this.loading = false;
        this.exams = []; // Clear exams in case of error
        this.filteredExams = [];
      }
    );
  }

  determineExamStatus(exam: Exam): Exam {
    const now = new Date();
    const examDate = exam.date ? new Date(exam.date) : null;

    if (!examDate) {
      return { ...exam, status: 'upcoming' }; // Default to upcoming if date is missing
    }

    if (!exam.endTime) {
      return { ...exam, status: 'upcoming' }; // Default to upcoming if endTime is missing
    }

    const [hours, minutes] = exam.endTime.split(':').map(Number);
    const examEndDateTime = new Date(examDate);
    examEndDateTime.setHours(hours, minutes, 0, 0);

    if (now < examDate) {
      return { ...exam, status: 'upcoming' };
    } else if (now > examEndDateTime) {
      return { ...exam, status: 'completed' };
    } else {
      return { ...exam, status: 'ongoing' };
    }
  }

  filterExams() {
    this.filteredExams = this.exams.filter(exam => {
      const matchesSearch = !this.searchText ||
        exam.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        exam.subjects.some(subject =>
          subject.toLowerCase().includes(this.searchText.toLowerCase())
        );
      const matchesStatus = !this.statusFilter || exam.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      'upcoming': 'blue',
      'Ongoing': 'gray',
      'completed': 'green'
    } as { [key: string]: string };
    return colors[status] || 'default';
  }

  assignMarks(exam: Exam) {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.router.navigate([`teacher/${boardName}/offline_test/${exam.id}/assign-marks`]);
  }

  viewResults(exam: Exam) {
    this.router.navigate(['/offline_test', exam.id, 'results']);
  }

  addNewExam() {
    this.router.navigate(['/offline_test/new']);
  }
}