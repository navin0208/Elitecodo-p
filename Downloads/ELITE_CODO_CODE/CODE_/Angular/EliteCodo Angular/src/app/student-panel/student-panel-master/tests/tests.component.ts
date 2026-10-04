import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
interface TestType {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}
@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent {
  route = inject(Router)
  activateROut = inject(ActivatedRoute)
  http = inject(HttpmethodsService)
  modal = inject(NzModalService)
  notification = inject(NzNotificationService)

  testTypes: TestType[] = [
    {
      id: 'Test-Create',
      title: ' Test Creation ',
      icon: 'read',
      description: 'Create tests based on specific book chapters, Subjects and Topics.',
      color: '#1890ff'
    }
  ];

  recentTests = [
    {
      type: 'Chapter Wise',
      createdAt: new Date(),
      subject: 'Physics',
      status: 'Completed',
      statusColor: 'green'
    },
    {
      type: 'Subject Wise',
      createdAt: new Date(),
      subject: 'Mathematics',
      status: 'In Progress',
      statusColor: 'orange'
    }
  ];
  openTestCreationModal(board: any) {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate(
      [`/student/${boardName}/test`], { queryParams: { type: `${board.id}` } }
    );
  }
  // openTestCreationModal(testType: TestType): void {
  //   this.modal.create({
  //     nzTitle: `Create ${testType.title}`,
  //     nzContent: `Modal content for ${testType.title}`,
  //     nzFooter: [
  //       {
  //         label: 'Cancel',
  //         onClick: () => this.modal.closeAll()
  //       },
  //       {
  //         label: 'Create Test',
  //         type: 'primary',
  //         onClick: () => {
  //           this.notification.success(
  //             'Test Creation',
  //             `${testType.title} initiated successfully!`
  //           );
  //           this.modal.closeAll();
  //         }
  //       }
  //     ]
  //   });
  // }

  viewTestDetails(test: any): void {
    this.modal.create({
      nzTitle: 'Test Details',
      nzContent: `Details for ${test.type} test on ${test.subject}`,
      nzFooter: null
    });
  }
}