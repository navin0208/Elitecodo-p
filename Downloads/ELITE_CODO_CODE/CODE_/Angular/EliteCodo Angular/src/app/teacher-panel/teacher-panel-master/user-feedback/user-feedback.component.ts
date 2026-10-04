// user-feedback.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { fileUpload } from 'src/app/shared/allURL';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.scss']
})
export class UserFeedbackComponent implements OnInit {
  feedbackForm: FormGroup;
  isSubmitting = false;
  fileList: any;
  previewImage: string | undefined = '';
  previewVisible = false;
  http = inject(HttpmethodsService);
  fileName: string | undefined;
  serverImage: string | undefined;
  isLoading = false;
  feedbackTypes = [
    { label: 'General Feedback', value: 'general', icon: 'message' },
    { label: 'Bug Report', value: 'bug', icon: 'bug' },
    { label: 'Feature Request', value: 'feature', icon: 'bulb' },
    { label: 'Technical Support', value: 'support', icon: 'tool' },
    { label: 'Content Issue', value: 'content', icon: 'file-text' }
  ];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private notificationService: NotificationService

  ) {
    this.feedbackForm = this.fb.group({
      type: ['general', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['medium', [Validators.required]], // Default value set to 'medium'
      category: ['', [Validators.required]],
      attachments: [''],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Initialize any required data
  }

  submitFeedback(): void {
    if (this.feedbackForm.valid) {

      let Request = {
        ...this.feedbackForm.value,
        attachments: this.serverImage,
        status: 'unread',
        senderId: Number(sessionStorage.getItem('teacherId'))
      }

      this.isSubmitting = true;

      console.log({ Request });

      this.http.postRequest(`api/reportstosuperadmin/sendreports`, Request).subscribe(
        (res) => {
          this.message.success('Feedback submitted successfully! Thank you for your input.');
          this.isSubmitting = false;
          this.feedbackForm.reset({
            type: 'general',
            priority: 'medium'
          });
          // Reset attachments and preview
          this.closePreview();
          this.serverImage = ''; // Clear server image path
          this.previewImage = ''; // Clear the preview image
          this.previewVisible = false; // Hide the preview modal
        }, err => {
          this.message.error('Something went Wrong! Please Try later.');
          this.isSubmitting = false;
        })

    } else {
      Object.values(this.feedbackForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  closePreview(): void {
    console.log('Closed Preview');

    this.previewVisible = false; // Hide the modal
    this.previewImage = ''; // Clear the preview image
  }
  // Preview file
  handlePreview = async (file: NzUploadFile) => {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

  // Validate and handle file selection
  // handleFileInput = (file: NzUploadFile, fileList: NzUploadFile[]) => {
  //   const allowedFileTypes = ['pdf', 'txt', 'png', 'jpg', 'jpeg']; // Allowed file types
  //   const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

  //   if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
  //     this.notificationService.showError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`, 'Error');
  //     return false; // Prevent the upload
  //   }

  //   this.fileName = file.name;
  //   return true; // Allow the upload
  // };

  handleRemove(): void {
    console.log('File to be removed:',);
    // Add custom logic here, such as removing the file from the backend or updating the UI.
  }


  // Convert file to Base64
  getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Custom request to handle server upload
  uploadFileToServer = (item: NzUploadXHRArgs): Subscription => {
    const formData = new FormData();
    formData.append('uploadfile', item.file as any);

    this.isLoading = true;

    // Return the Subscription object from the HTTP request
    return this.http.postRequest(fileUpload, formData).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (data.status === true) {
          this.serverImage = data.path;
          this.notificationService.showSuccess('Successfully uploaded File', 'Success');
          item.onSuccess!(data, item.file!, null); // Notify success
        } else {
          this.notificationService.showError('Failed to upload File', 'Error');
          item.onError!(new Error('Failed to upload File'), item.file!); // Notify error
        }
      },
      (error) => {
        this.isLoading = false;
        this.notificationService.showError('Something went wrong during the upload', 'Error');
        item.onError!(error, item.file!); // Notify error
      }
    );
  };
  isImage(fileValue: string | null): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!fileValue) return false;

    // Check if it's a Base64 string (image preview)
    if (fileValue.startsWith('data:image')) return true;

    // Check file extension for uploaded path
    const extension = fileValue.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }
  handleFileInput(event: any, controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0]; // Access file directly from the event
    this.fileName = file?.name;


    if (!file) {
      this.notificationService.showError('No file selected', 'Error');
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''; // Fallback to an empty string if undefined



    this.isLoading = true; // Start loader
    const formData = new FormData();
    formData.append('uploadfile', file);

    this.http.postRequest(fileUpload, formData).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (data.status === true) {
          this.serverImage = data.path;
          console.log('serverImage', this.serverImage);

          this.notificationService.showSuccess('Successfully uploaded File', 'Success');
          this.feedbackForm.setValue({
            attachments: data.path // Use the server-provided path
          });
        } else {
          this.notificationService.showError('Failed to upload File', 'Error');
        }
      },
      (error) => {
        this.isLoading = false;
        this.notificationService.showError('Something went wrong during the upload', 'Error');
      }
    );

  }

  getFeedbackTypeIcon(type: string): string {
    return this.feedbackTypes.find(t => t.value === type)?.icon || 'message';
  }
}