import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, retry } from 'rxjs';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-standard-test',
  templateUrl: './standard-test.component.html',
  styleUrls: ['./standard-test.component.css'],
})
export class StandardTestComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}
  http = inject(HttpmethodsService);

  standardlist: any;

  activateROut = inject(ActivatedRoute);
  type: any;

  selectedStandardIds: number[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.type = queryParams['type']; // Replace 'type' with the query parameter name
      console.log('Query parameter:', this.type);
    });
    this.getStandards();
  }

  OpenTestSubject() {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    // Ensure `standardId` is passed correctly in the queryParams object
    // Convert array to string before storing
    sessionStorage.setItem(
      'selectedStandardIds',
      JSON.stringify(this.selectedStandardIds)
    );
    sessionStorage.setItem('selectedSubjectIds', JSON.stringify([]));

    this.router.navigate(
      [`/teacher/${boardName}/test`],
      { queryParams: { type: this.type } } // Explicitly use the standardId parameter
    );
  }

  getStandards() {
    let teacherId = sessionStorage.getItem('teacherId');
    let entranceExamId = sessionStorage.getItem('entranceExamIdOfTeacher');

    this.http
      .getRequest(
        `api/auth/userandentrancewisestandards/${teacherId}/${entranceExamId}`
      )
      .pipe(
        retry(3), // Retry the request up to 3 times
        catchError((error) => {
          console.error('Error fetching standards:', error);

          // Toastr notification for error
          this.toastr.error(
            'Failed to fetch standards. Please try again later.',
            'Error'
          );

          return of([]); // Return an empty array to handle the error gracefully
        })
      )
      .subscribe((response) => {
        this.standardlist = response;
        console.log(response);
      });
  }

  // Check if a standard is selected
  isStandardSelected(standardId: number): boolean {
    return this.selectedStandardIds.includes(standardId);
  }

  // Toggle standard selection
  toggleStandardSelection(standardId: number): void {
    if (this.isStandardSelected(standardId)) {
      // Remove from array if already selected
      this.selectedStandardIds = this.selectedStandardIds.filter(
        (id) => id !== standardId
      );
    } else {
      // Add to array if not selected
      this.selectedStandardIds.push(standardId);
    }
  }
}
