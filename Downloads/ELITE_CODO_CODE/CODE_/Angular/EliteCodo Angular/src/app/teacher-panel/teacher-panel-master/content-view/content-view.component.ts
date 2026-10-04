import { Component, inject, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { delete_Upload_Content } from 'src/app/shared/allURL';

interface UploadedContent {
  uploadContentId: number;
  entranceExamMaster: {
    entranceExamId: number;
    entranceExamName: string;
  };
  standardMaster: {
    standardId: number;
    standardName: string;
  };
  subjectMaster: {
    subjectId: number;
    subjectName: string;
  };
  chapterMaster: {
    chapterId: number;
    chapterName: string;
  };
  topicMaster?: {
    topicId: number;
    topicName: string;
  };
  contentType: string;
  url: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
  date: string;
  status: string;
  examYear: string;
}

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.scss'],
})
export class ContentViewComponent implements OnInit {
  uploadedContent: UploadedContent[] = [];
  filteredContent: UploadedContent[] = [];
  contentTypes: string[] = [
    'All',
    'formulas',
    'notes',
    'summary',
    'video',
    'schedule',
    'question',
  ];
  selectedContentType: string | null = null;

  isDetailModalVisible = false;
  selectedContent: UploadedContent | null = null;

  constructor(
    public http: HttpmethodsService,
    private notificationService: NotificationService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchUploadedContent();
  }

  fetchUploadedContent() {
    // Replace with your actual API endpoint
    // api/uploadcontent/getall
    this.http
      .getRequest(
        `api/uploadcontent/getAllById/${sessionStorage.getItem('teacherId')}`
      )
      .subscribe(
        (response: any) => {
          this.uploadedContent = response;
          this.filteredContent = response;
        },
        (error) => {
          this.notificationService.showError(
            'Failed to fetch content',
            'Error'
          );
        }
      );
  }
  // deleteContent(content: UploadedContent) {
  //   const confirmation = confirm(
  //     `Are you sure you want to delete this content? ID: ${content.uploadContentId}`
  //   );

  //   if (confirmation) {
  //     this.http.deleteRequest(`api/uploadcontent/delete`, content.uploadContentId).subscribe(
  //       () => {
  //         this.notificationService.showSuccess('Content deleted successfully', 'Success');
  //         this.uploadedContent = this.uploadedContent.filter(
  //           (item) => item.uploadContentId !== content.uploadContentId
  //         );
  //         this.filteredContent = this.filteredContent.filter(
  //           (item) => item.uploadContentId !== content.uploadContentId
  //         );
  //       },
  //       (error) => {
  //         this.notificationService.showError('Failed to delete content', 'Error');
  //       }
  //     );
  //   }
  // }
  deleteContent(content: any): void {
    this.modal.confirm({
      nzTitle: `Are you sure you want to delete this content? ID: ${content.uploadContentId}`,
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http
          .deleteRequest(`api/uploadcontent/delete`, content.uploadContentId)
          .subscribe(
            (res) => {
              this.fetchUploadedContent();
              this.message.success('Content deleted successfully');
            },
            (err) => {
              this.message.error('Failed to delete content');
            }
          );
      },
      nzCancelText: 'No',
    });
  }
  filterContent() {
    console.log('selectedContentType', this.selectedContentType);
    if (this.selectedContentType != 'All') {
      this.filteredContent = this.uploadedContent.filter(
        (content) => content.contentType === this.selectedContentType
      );
    } else {
      console.log('filteredContent', this.filteredContent);
      this.filteredContent = this.uploadedContent;
    }
  }

  viewContentDetails(content: UploadedContent) {
    console.log({ content });

    this.selectedContent = content;
    this.isDetailModalVisible = true;
  }

  closeDetailModal() {
    this.isDetailModalVisible = false;
    this.selectedContent = null;
  }

  isValidUrl(url: string | null): boolean {
    console.log({ url });

    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
