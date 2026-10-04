import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-testtopic',
  templateUrl: './testtopic.component.html',
  styleUrls: ['./testtopic.component.css'],
})
export class TesttopicComponent implements OnInit {
  http = inject(HttpmethodsService);
  TopicList: any = [];
  chapterId: any;
  type: any;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      // this.standardId = queryParams['standardId'];
      // this.subjectName = queryParams['subjectName'];
      // this.subjectId = queryParams['subjectId'];
      this.type = queryParams['type'];

      this.chapterId = JSON.parse(
        sessionStorage.getItem('selectedChapterIds') || '[]'
      );

      this.getTopics();
    });
  }

  selectedItems: number[] = []; // assuming topicId is a number

  toggleSelection(card: any): void {
    const index = this.selectedItems.indexOf(card.topicId);

    if (index === -1) {
      this.selectedItems.push(card.topicId);
    } else {
      this.selectedItems.splice(index, 1);
    }
  }

  removeSelection(card: any): void {
    const index = this.selectedItems.indexOf(card.topicId);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
  }

  getSelectedItems(): any[] {
    return this.TopicList.filter((card: any) =>
      this.selectedItems.includes(card.topicId)
    );
  }

  submitSelection(): void {
    console.log('Selected topic IDs:', this.selectedItems);
    // Add your submission logic here
    // You can access the selected topic IDs via this.selectedItems

    sessionStorage.setItem(
      'selectedTopicIds',
      JSON.stringify(this.selectedItems)
    );

    const boardName = this.route.snapshot.paramMap.get('name');
    this.router.navigate([`/teacher/${boardName}/testcreation`], {
      queryParams: {
        type: this.type,
        // standardId: this.standardId,
        // subjectId: this.subjectId,
      },
    });
  }

  //api

  getTopics() {
    this.http
      .getRequest(`api/topic/chapterwiseActivetopics/${this.chapterId[0]}`)
      .subscribe((res) => {
        this.TopicList = res;
        console.log('List', res);
      });
  }
}
