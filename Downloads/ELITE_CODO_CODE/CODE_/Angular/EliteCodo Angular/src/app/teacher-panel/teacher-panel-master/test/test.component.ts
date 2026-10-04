import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, retry } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
  useAnimation,
} from '@angular/animations';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '0.3s ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('cardHover', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ transform: 'scale(0.9)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class TestComponent implements OnInit, OnDestroy {
  isLoading = false;
  type: any;
  subjectList: any;
  standardId: any;
  animationState = false;
  selectedStandardIds: any;

  selectedSubjectIds: number[] = [];

  constructor(
    public http: HttpmethodsService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.animationState = !this.animationState;
    this.route.queryParams.subscribe((queryParams) => {
      this.type = queryParams['type'];
      console.log(this.type);

      this.selectedStandardIds = JSON.parse(
        sessionStorage.getItem('selectedStandardIds') || '[]'
      );

      this.getSubject();
    });
  }

  ngOnDestroy(): void {}

  OpenTestChapter() {
    sessionStorage.setItem(
      'selectedSubjectIds',
      JSON.stringify(this.selectedSubjectIds)
    );

    sessionStorage.setItem('selectedChapterIds', JSON.stringify([]));
    sessionStorage.setItem('selectedTopicIds', JSON.stringify([]));

    const boardName = this.route.snapshot.paramMap.get('name');

    if (this.type == 'weightage-wise') {
      this.router.navigate([`/teacher/${boardName}/testcreation`], {
        queryParams: {
          type: this.type,
        },
      });
    } else {
      this.router.navigate([`/teacher/${boardName}/testchapter`], {
        queryParams: {
          type: this.type,
        },
      });
    }
  }

  OpenTestChapterForSingleSub(subjectId: any, subjectName: any) {
    sessionStorage.setItem('selectedSubjectIds', JSON.stringify([subjectId]));

    sessionStorage.setItem('selectedChapterIds', JSON.stringify([]));
    sessionStorage.setItem('selectedTopicIds', JSON.stringify([]));

    const boardName = this.route.snapshot.paramMap.get('name');

    if (this.type == 'weightage-wise') {
      this.router.navigate([`/teacher/${boardName}/testcreation`], {
        queryParams: {
          type: this.type,
        },
      });
    } else {
      this.router.navigate([`/teacher/${boardName}/testchapter`], {
        queryParams: {
          type: this.type,
          standardId: this.standardId,
        },
      });
    }
  }

  getSubject() {
    this.isLoading = true;
    const teacherId = sessionStorage.getItem('teacherId');
    const entranceExamId = sessionStorage.getItem('entranceExamIdOfTeacher');

    this.http
      .postRequest(`api/lookup/standards/subjects`, {
        standardIds: this.selectedStandardIds,
      })
      .pipe(
        retry(3),
        catchError((error) => {
          console.error('Error fetching subjects:', error);
          this.message.error(
            'Failed to fetch subjects. Please try again later.'
          );
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((response) => {
        this.subjectList = response;
        this.isLoading = false;
        this.animationState = !this.animationState;
      });
  }

  getCardColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #6e8efb 0%, #4a6cf7 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #66a6ff 100%)',
      'linear-gradient(135deg, #c3ec52 0%, #0ba29d 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];
    return colors[index % colors.length];
  }

  getIconForSubject(subjectName: string): string {
    const iconMap: { [key: string]: string } = {
      Physics: 'experiment',
      Chemistry: 'flask',
      Mathematics: 'calculator',
      Biology: 'bug',
      English: 'read',
      History: 'global',
      Geography: 'environment',
    };

    return iconMap[subjectName] || 'book';
  }

  getIconColor(index: number): string {
    const colors = [
      '#4a6cf7',
      '#f5576c',
      '#66a6ff',
      '#0ba29d',
      '#fda085',
      '#a18cd1',
    ];
    return colors[index % colors.length];
  }

  // Toggle subject selection
  toggleSubjectSelection(subjectId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // Add to array if checked
      if (!this.selectedSubjectIds.includes(subjectId)) {
        this.selectedSubjectIds.push(subjectId);
      }
    } else {
      // Remove from array if unchecked
      this.selectedSubjectIds = this.selectedSubjectIds.filter(
        (id) => id !== subjectId
      );
    }

    console.log('Selected Subject IDs:', this.selectedSubjectIds);
  }

  // Check if a subject is selected
  isSubjectSelected(subjectId: number): boolean {
    return this.selectedSubjectIds.includes(subjectId);
  }
}