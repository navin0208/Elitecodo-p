import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface PdfFile {
  year: number;
  title?: string;
  url: string;
}

@Component({
  selector: 'app-question-bank',
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('{{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ]

})
export class QuestionBankComponent implements OnInit {
  @ViewChild('pdfViewer') pdfViewer!: ElementRef;
  http = inject(HttpmethodsService);
  colors: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  selectedPdfTitle: string | null = null;
  // Predefined PDF list 
  pdfFiles!: PdfFile[]
  //  = [
  //   {
  //     year: 2022,
  //     title: 'Website Modules and Flow',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/Website_Modules_and_Flow.pdf'
  //   },
  //   {
  //     year: 2022,
  //     title: 'ICON 2-1',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/ICON 2-1.pdf'
  //   },
  //   {
  //     year: 2025,
  //     title: 'Content Upload (Biology Formulas)',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/Audit Report (2).pdf'
  //   },
  //   {
  //     year: 2025,
  //     title: 'Chapter Name (Biomolecules)',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/Audit Report (2).pdf'
  //   },
  //   {
  //     year: 2025,
  //     title: 'Description (Math Formulas)',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/experienceletter_shubham_kale.pdf'
  //   },
  //   {
  //     year: 2025,
  //     title: 'Content Title (Trigonometry Notes)',
  //     url: 'https://zplusglobalmarketinsights.com/auctionBanksImages/ICON 2-1.pdf'
  //   },
  //   {
  //     year: 2023,
  //     title: 'Sample Research Paper',
  //     url: 'https://example.com/pdfs/research_paper_sample.pdf'
  //   },
  //   {
  //     year: 2024,
  //     title: 'Advanced Calculus Guide',
  //     url: 'https://example.com/pdfs/calculus_advanced.pdf'
  //   }
  // ];

  selectedYear: number | null = null;
  filteredPdfs: PdfFile[] = [];
  selectedPdf: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getQuestionBankData()
  }

  // Get unique years from pdfFiles
  get years(): number[] {
    const yearsSet = new Set<number>();
    this.pdfFiles.forEach(pdf => yearsSet.add(pdf.year));
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order
  }

  getQuestionBankData() {
    this.http.getRequest(`api/uploadcontent/getAllBystudentId/${sessionStorage.getItem('studentId')}`).subscribe((res: any) => {
      console.log({ res });
      this.pdfFiles = res;
    })
  }

  // Function to return a random color class
  randomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
  }

  // Add this method to clear the title when changing years
  selectYear(year: number): void {
    this.selectedYear = year;
    this.filteredPdfs = this.pdfFiles.filter(pdf => pdf.year === year);
    // Reset selected PDF and title
    this.selectedPdf = null;
    this.selectedPdfTitle = null;
  }

  // Select and view a specific PDF
  viewPdf(pdf: any): void {
    // Sanitize the URL to prevent security issues
    this.selectedPdf = this.sanitizer.bypassSecurityTrustResourceUrl(pdf.url);
    this.selectedPdfTitle = pdf.title; // Store the PDF title

    // Scroll to PDF viewer
    setTimeout(() => {
      this.pdfViewer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Check if a year has PDFs
  hasPdfs(year: number): boolean {
    return this.pdfFiles.some(pdf => pdf.year === year);
  }
}