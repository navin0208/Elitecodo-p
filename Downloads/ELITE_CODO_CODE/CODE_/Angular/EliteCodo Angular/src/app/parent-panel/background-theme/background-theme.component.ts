import { Component, inject } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

@Component({
  selector: 'app-background-theme',
  templateUrl: './background-theme.component.html',
  styleUrls: ['./background-theme.component.css']
})
export class BackgroundThemeComponent {
  http = inject(HttpmethodsService)

}
