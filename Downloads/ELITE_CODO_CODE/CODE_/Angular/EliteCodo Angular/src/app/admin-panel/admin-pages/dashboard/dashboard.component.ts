import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { dashboardCountAPI } from 'src/app/shared/allURL';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as echarts from 'echarts';

import {
  Chart,
  LineController,
  LineElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
} from 'chart.js';
import { ToastrService } from 'ngx-toastr';
// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
);
Chart.register(ChartDataLabels); // Register the plugin with Chart.js

interface Sale {
  id: number;
  date: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  growth: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', '../../../../assets/css/form.css']
})
export class DashboardComponent implements OnInit {
  http = inject(HttpmethodsService)
  notificationService = inject(NotificationService)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  dashboardCountList: any = [];
  charts: any = {};
  currentDate = new Date();
  selectedPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  searchTerm: string = '';
  currentPage: number = 1;
  Math = Math; // Make Math available in template
  @ViewChild('testsChart') chartElement!: ElementRef;
  // New properties for expiring users enhancement
  activeTab: string = 'expiring';
  activeExpiringUsers: any[] = [];
  expiredUsers: any[] = [];
  showExpiryDateModal: boolean = false;
  selectedUser: any = null;
  newExpiryDate: any = '';
  today: Date = new Date();
  isLoading = false;
  pageSize = 3;
  pageIndex = 1;
  total = 0;
  displayData: any[] = [];
  toastr = inject(ToastrService)

  testGenerate = { teacher: 0, student: 0 }; // Add default values



  itemsPerPage = 5; // Number of items per page
  paginatedSales: Sale[] = []; // Explicitly type the property
  readonly titleToRouteMap: { [key: string]: string } = {
    'Total admin': '/admin/layout/admin-management',
    'Total Teachers': '/admin/layout/teacher-management',
    'Total Parents': '/admin/layout/student-management',
    'Total Students': '/admin/layout/student-management',
    'Total Institutions': '/admin/layout/Institution-management'
  };
  userStats: any;

  activationCards = [
    {
      title: 'Teachers Activations',
      count: 1234,
      icon: 'fas fa-chalkboard-teacher',
      colorClass: 'text-white',
      bgClass: 'bg-blue'
    },
    {
      title: 'Students Activations',
      count: 5678,
      icon: 'fas fa-user-graduate',
      colorClass: 'text-white',
      bgClass: 'bg-green'
    },
    {
      title: 'Institutions Activations',
      count: 891,
      icon: 'fas fa-school',
      colorClass: 'text-white',
      bgClass: 'bg-purple'
    },
    {
      title: 'Parents Activations',
      count: 2345,
      icon: 'fas fa-users',
      colorClass: 'text-white',
      bgClass: 'bg-orange'
    }
  ];

  expiringUsers: any


  salesData = [
    {
      id: 1,
      date: '2024-03-15',
      customer: 'Acme Corp',
      product: 'Enterprise License',
      amount: 1299.99,
      status: 'completed',
      growth: 15.5
    },
    {
      id: 2,
      date: '2024-03-14',
      customer: 'TechStart Inc',
      product: 'Basic License',
      amount: 499.99,
      status: 'pending',
      growth: -5.2
    },
    {
      id: 3,
      date: '2024-03-14',
      customer: 'Global Solutions',
      product: 'Premium Package',
      amount: 899.99,
      status: 'completed',
      growth: 8.7
    },
    {
      id: 4,
      date: '2024-03-13',
      customer: 'Digital Dreams',
      product: 'Enterprise License',
      amount: 1499.99,
      status: 'failed',
      growth: -12.3
    },
    {
      id: 5,
      date: '2024-03-13',
      customer: 'Innovation Labs',
      product: 'Basic License',
      amount: 399.99,
      status: 'completed',
      growth: 6.8
    },
    {
      id: 6,
      date: '2024-03-15',
      customer: 'Sk Shubham',
      product: 'Enterprise License',
      amount: 1299.99,
      status: 'completed',
      growth: 15.5
    },
    {
      id: 7,
      date: '2024-03-14',
      customer: 'Sk Shubham',
      product: 'Basic License',
      amount: 499.99,
      status: 'pending',
      growth: -5.2
    },
    {
      id: 8,
      date: '2024-03-14',
      customer: 'Sk Shubham',
      product: 'Premium Package',
      amount: 899.99,
      status: 'completed',
      growth: 8.7
    },
    {
      id: 9,
      date: '2024-03-13',
      customer: 'Sk Shubham',
      product: 'Enterprise License',
      amount: 1499.99,
      status: 'failed',
      growth: -12.3
    },
    {
      id: 10,
      date: '2024-03-13',
      customer: 'Sk Shubham',
      product: 'Basic License',
      amount: 399.99,
      status: 'completed',
      growth: 6.8
    }
  ]

  notSHown = false;

  ngOnInit() {

    this.testCountForAdmin();


    this.getexpiringusers();

    this.allUserForCount();
    this.updatePagination();
    this.initTestsChart();
    this.initializeCharts();

    this.loadDashboardData();


  }

  loadDashboardData() {
    // Load existing dashboard data

    // For the expiring users, split into active and expired
    this.filterExpiringUsers();
  }
  getexpiringusers() {
    this.isLoading = true;
    // ${sessionStorage.getItem('adminId')
    this.http.getRequest(`api/auth/expiring-users/-1`).subscribe(
      (res: any) => {
        this.expiringUsers = res;
        console.log('expiringUsers', this.expiringUsers);
        this.total = this.expiringUsers.length;
        this.filterExpiringUsers(); // Call this here after data is received
        this.updateDisplayData();
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  testCountForAdmin() {
    this.http.getRequest(`api/test/count/${sessionStorage.getItem('adminId')}`).subscribe((res: any) => {
      this.testGenerate = res;
      this.initTestsChart(); // Reinitialize chart with new data
    })
  }
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  openExpiryDateModal(user: any) {
    this.selectedUser = user;

    // Create date object for the expiry date (today + daysLeft)
    const expiryDate = new Date();
    if (user.daysLeft > 0) {
      expiryDate.setDate(expiryDate.getDate() + user.daysLeft);
    }

    // Format the date for the date input (YYYY-MM-DD)
    this.newExpiryDate = expiryDate, 'yyyy-MM-dd';

    this.showExpiryDateModal = true;
  }

  updateDisplayData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.expiringUsers.slice(start, end);
  }
  filterExpiringUsers() {
    if (!this.expiringUsers) return;

    // Split users into active and expired based on daysLeft
    this.activeExpiringUsers = this.expiringUsers.filter((user: any) => user.daysLeft > 0);
    this.expiredUsers = this.expiringUsers.filter((user: any) => user.daysLeft <= 0);

    console.log('activeExpiringUsers', this.activeExpiringUsers);
    console.log('expiredUsers', this.expiredUsers);
  }
  closeModal(event: Event) {
    // Check if click was on overlay (background) or close/cancel buttons
    const target = event.target as HTMLElement;

    if (
      target.classList.contains('modal-overlay') ||
      target.closest('.close-btn') ||
      target.closest('.cancel-btn') ||
      target.closest('.modal-close') // Add this class to your close icon
    ) {
      this.showExpiryDateModal = false;
      this.selectedUser = null;
      this.newExpiryDate = null;
      event.stopPropagation();
    }
  }

  updateExpiryDate() {
    if (!this.selectedUser || !this.newExpiryDate) {
      this.toastr.error('Please select a valid expiry date');
      return;
    }

    const userId = this.selectedUser.userId;
    const expiryDate = this.newExpiryDate;
    let obj = {
      userId,
      expiryDate
    }
    console.log({ obj });

    // Call service to update expiry date
    this.http.putRequest('api/auth/update-expiry', obj).subscribe(
      (response) => {
        this.toastr.success('User expiry date updated successfully');

        // Re-filter users to place them in the correct arrays
        this.filterExpiringUsers();
        this.getexpiringusers();
        // Close modal after successful update
        this.showExpiryDateModal = false;
        this.selectedUser = null;
        this.newExpiryDate = null;
      },
      (error) => {
        this.toastr.error('Failed to update expiry date. Please try again.');
        console.error('Error updating expiry date:', error);
      }
    );
  }

  initTestsChart(): void {
    const chartDom = document.getElementById('testsGeneratedChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    // Use the current values or fallback to 0 if undefined
    const teacherCount = this.testGenerate?.teacher || 0;
    const studentCount = this.testGenerate?.student || 0;

    const option = {
      title: {
        text: 'Tests Generated by Teacher and Student',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#333'
        },
        left: 'center',
        top: 0
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          const dataIndex = params[0].dataIndex;
          const categoryName = params[0].name;
          const value = params[0].value;

          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${categoryName}</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; 
                  background-color: ${params[0].color}; margin-right: 6px;"></span>
                <span>Tests Generated: ${value}</span>
              </div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#eee',
        borderWidth: 1,
        padding: 0,
        textStyle: {
          color: '#333'
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Teachers', 'Students'],
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: '#ddd'
          }
        },
        axisLabel: {
          fontSize: 12,
          color: '#666',
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Tests',
        nameTextStyle: {
          color: '#999',
          fontSize: 12,
          padding: [0, 0, 0, 5]
        },
        splitLine: {
          lineStyle: {
            color: '#f1f1f1',
            type: 'dashed'
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#999',
          fontSize: 11
        }
      },
      series: [
        {
          type: 'bar',
          data: [
            {
              value: teacherCount,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(74, 144, 226, 0.9)' },
                  { offset: 1, color: 'rgba(74, 144, 226, 0.6)' }
                ]),
                borderRadius: [8, 8, 0, 0]
              }
            },
            {
              value: studentCount,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(39, 174, 96, 0.9)' },
                  { offset: 1, color: 'rgba(39, 174, 96, 0.6)' }
                ]),
                borderRadius: [8, 8, 0, 0]
              }
            }
          ],
          barWidth: '60%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.2)',
            borderRadius: [8, 8, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#555',
            formatter: '{c}'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            }
          },
          animationDuration: 1500,
          animationEasing: 'elasticOut'
        }
      ]
    };

    myChart.setOption(option);

    // Handle resize
    window.addEventListener('resize', () => {
      if (myChart) {
        myChart.resize();
      }
    });
  }
  navigateTo(title: string): void {
    const route = this.titleToRouteMap[title];
    if (route) {
      this.router.navigate([route]);
    }
  }
  get filteredSales() {
    return this.salesData.filter(sale =>
      Object.values(sale).some((value: any) =>
        value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }
  allUserForCount() {
    this.http.getRequest(`api/auth/getUserStats/${sessionStorage.getItem('adminId')}`).subscribe((response) => {
      console.log({ allUserForCount: response });
      this.userStats = response;
    })
  }
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSales = this.salesData.slice(startIndex, endIndex);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < Math.ceil(this.salesData.length / this.itemsPerPage)) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  getRandomGradient(): string {
    const gradients = ['gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange'];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }

  initializeCharts() {
    // Tests Generated Chart
    this.charts.testsChart = new Chart('testsChart', {
      type: 'bar',
      data: {
        labels: ['Teachers', 'Students'],
        datasets: [{
          label: '',
          data: [120, 350],
          backgroundColor: ['rgba(74, 144, 226, 0.8)', 'rgba(39, 174, 96, 0.8)'],
          borderColor: ['rgb(74, 144, 226)', 'rgb(39, 174, 96)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Tests Generated by Teacher and Student'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        },
        interaction: {
          mode: 'nearest', // Ensures hover is based on the nearest data point
          intersect: true, // Ensures hover only works on the points
        },
      }
    });

    // Activations Chart
    this.charts.activationsChart = new Chart('activationsChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Months or time intervals
        datasets: [
          {
            label: 'Teachers Activations',
            data: [45, 50, 60, 70, 65, 80], // Replace with actual data
            fill: false,
            borderColor: 'rgb(255, 99, 132)', // Unique color for Teachers
            tension: 0.1,
            pointBackgroundColor: 'rgb(255, 99, 132)', // Point color
            pointRadius: 5, // Size of points
            pointHoverRadius: 7, // Size of points on hover
          },
          {
            label: 'Students Activations',
            data: [35, 40, 55, 65, 75, 60], // Replace with actual data
            fill: false,
            borderColor: 'rgb(54, 162, 235)', // Unique color for Students
            tension: 0.1,
            pointBackgroundColor: 'rgb(54, 162, 235)', // Point color
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Institutions Activations',
            data: [20, 25, 30, 35, 40, 50], // Replace with actual data
            fill: false,
            borderColor: 'rgb(255, 206, 86)', // Unique color for Institutions
            tension: 0.1,
            pointBackgroundColor: 'rgb(255, 206, 86)', // Point color
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Parents Activations',
            data: [15, 20, 25, 30, 35, 40], // Replace with actual data
            fill: false,
            borderColor: 'rgb(75, 192, 192)', // Unique color for Parents
            tension: 0.1,
            pointBackgroundColor: 'rgb(75, 192, 192)', // Point color
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          datalabels: {
            display: true, // Show the data labels
            color: 'black', // Color of the labels
            font: {
              size: 12, // Font size for the labels
            },
            formatter: (value) => `${value}`, // Customize the label text
          }
        },
        interaction: {
          mode: 'nearest', // Ensures hover is based on the nearest data point
          intersect: true, // Ensures hover only works on the points
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months' // Label for the X-axis
            }
          },
          y: {
            title: {
              display: true,
              text: 'Number of Activations' // Label for the Y-axis
            },
            beginAtZero: true
          }
        }
      }
    });

    // Sales Chart
    this.charts.salesChart = new Chart('salesChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: 'rgb(74, 144, 226)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Sales Amount'
            }
          }
        }
      }
    });

    // Questions by Chapter Chart
    this.charts.chapterChart = new Chart('chapterChart', {
      type: 'doughnut',
      data: {
        labels: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'],
        datasets: [{
          data: [300, 250, 200, 150],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });

    // Questions by Subject Chart
    this.charts.subjectChart = new Chart('subjectChart', {
      type: 'pie',
      data: {
        labels: ['Math', 'Science', 'English', 'History'],
        datasets: [{
          data: [400, 300, 200, 100],
          backgroundColor: [
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });

    // Questions by Exam Chart
    this.charts.examChart = new Chart('examChart', {
      type: 'bar',
      data: {
        labels: ['Mid Term', 'Final', 'Quiz', 'Practice'],
        datasets: [{
          label: 'Number of Questions',
          data: [500, 450, 300, 200],
          backgroundColor: [
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Add methods to update charts when data changes
  updateCharts(newData: any) {
    // Update each chart with new data
    Object.keys(this.charts).forEach(chartKey => {
      if (this.charts[chartKey] && newData[chartKey]) {
        this.charts[chartKey].data = newData[chartKey];
        this.charts[chartKey].update();
      }
    });
  }

  // Clean up charts on component destroy
  ngOnDestroy() {
    Object.values(this.charts).forEach((chart: any) => {
      if (chart) {
        chart.destroy();
      }
    });
  }



  // getAllDashbordCount() {
  //   this.http.getRequest(dashboardCountAPI).subscribe(
  //     (res: any) => {
  //       console.log({ res });
  //       this.dashboardCountList = res || 0;
  //     })
  // }

}
