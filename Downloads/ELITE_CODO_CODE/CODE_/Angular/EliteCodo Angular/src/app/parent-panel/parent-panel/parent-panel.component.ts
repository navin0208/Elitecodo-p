import { Component } from '@angular/core';

@Component({
  selector: 'app-parent-panel',
  templateUrl: './parent-panel.component.html',
  styleUrls: ['./parent-panel.component.css']
})
export class ParentPanelComponent {
  watermarkImage!: string
  constructor() { }

  ngOnInit(): void {
    this.watermarkImage = String(sessionStorage.getItem('adminwatermarkImage'))
  }

}
