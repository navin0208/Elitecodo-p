import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, retry } from 'rxjs';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

@Component({
  selector: 'app-testchapter',
  templateUrl: './testchapter.component.html',
  styleUrls: ['./testchapter.component.scss'],
})
export class TestchapterComponent {
  constructor(
    public http: HttpmethodsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  chapterlist: any;
  standardId: any;
  subjectId: any;
  type: any;
  subjectName: any;
  selectedSubjectIds: any;
  selectedChapterIds: number[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      // this.standardId = queryParams['standardId'];
      // this.subjectName = queryParams['subjectName'];
      // this.subjectId = queryParams['subjectId'];

      this.type = queryParams['type'];

      this.selectedSubjectIds = JSON.parse(
        sessionStorage.getItem('selectedSubjectIds') || '[]'
      );

      this.http
        .postRequest(`api/lookup/subjects/chapters`, {
          subjectIds: this.selectedSubjectIds,
        })
        .pipe(
          retry(3),
          catchError((error) => {
            console.error('Error fetching chapters:', error);
            this.toastr.error(
              'Failed to fetch chapters. Please try again later.',
              'Error'
            );
            return of([]);
          })
        )
        .subscribe((response) => {
          this.chapterlist = response;
        });
    });
  }

  // Select all chapters across all subjects
  selectAllChapters(): void {
    this.selectedChapterIds = [];
    this.chapterlist.forEach((subject: any) => {
      subject.chapters.forEach((chapter: any) => {
        if (!this.selectedChapterIds.includes(chapter.chapterId)) {
          this.selectedChapterIds.push(chapter.chapterId);
        }
      });
    });
  }

  // Deselect all chapters
  deselectAllChapters(): void {
    this.selectedChapterIds = [];
  }

  // Toggle chapter selection
  toggleChapterSelection(chapterId: number, event: Event): void {
    event.stopPropagation();
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedChapterIds.includes(chapterId)) {
        this.selectedChapterIds.push(chapterId);
      }
    } else {
      this.selectedChapterIds = this.selectedChapterIds.filter(
        (id) => id !== chapterId
      );
    }
  }

  // Check if a chapter is selected
  isChapterSelected(chapterId: number): boolean {
    return this.selectedChapterIds.includes(chapterId);
  }

  opentestcreationMultiple() {
    sessionStorage.setItem(
      'selectedChapterIds',
      JSON.stringify(this.selectedChapterIds)
    );

    // sessionStorage.setItem(
    //   'selectedSubjectIds',
    //   JSON.stringify(this.selectedSubjectIds)
    // );

    const boardName = this.route.snapshot.paramMap.get('name');
    this.router.navigate([`/teacher/${boardName}/testcreation`], {
      queryParams: {
        type: this.type,

        // standardId: this.standardId,
        // subjectId: this.subjectId,
      },
    });
  }

  opentestcreation(chapterId: any) {
    sessionStorage.setItem('selectedChapterIds', JSON.stringify([chapterId]));

    const boardName = this.route.snapshot.paramMap.get('name');

    if (this.type !== 'chapter-wise') {
      this.router.navigate([`/teacher/${boardName}/testtopic`], {
        queryParams: {
          type: this.type,
          // standardId: this.standardId,
          // subjectId: this.subjectId,
        },
      });
    } else {
      this.router.navigate([`/teacher/${boardName}/testcreation`], {
        queryParams: {
          type: this.type,

          // standardId: this.standardId,
          // subjectId: this.subjectId,
        },
      });
    }
  }
}
