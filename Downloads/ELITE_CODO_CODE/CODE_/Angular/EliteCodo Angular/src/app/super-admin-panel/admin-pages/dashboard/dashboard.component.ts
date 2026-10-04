import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { activationcountsAPI, countsforsuperadminAPI, dashboardCountAPI } from 'src/app/shared/allURL';
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
import { DatePipe } from '@angular/common';

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
Chart.register(ChartDataLabels);

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
  toastr = inject(ToastrService)
  dashboardCountList: any = [];
  charts: any = {};
  currentDate = new Date();
  selectedPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  searchTerm: string = '';
  currentPage: number = 1;
  Math = Math;
  @ViewChild('testsChart') chartElement!: ElementRef;
  chart!: echarts.ECharts;
  isLoading = false;
  displayData: any[] = [];
  itemsPerPage = 5;
  paginatedSales: Sale[] = [];
  userStats: any
  activationCards: any
  testGenerate = { teacher: 0, student: 0 };
  activeTab: string = 'expiring';
  activeExpiringUsers: any[] = [];
  expiredUsers: any[] = [];
  showExpiryDateModal: boolean = false;
  selectedUser: any = null;
  newExpiryDate: any = '';
  today: Date = new Date();
  expiringUsers: any[] = [];
  pageSize = 3;
  pageIndex = 1;
  total = 0;
  isLoadingExpiring = false;
  isLoadingExpired = false;

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

  readonly titleToRouteMap: { [key: string]: string } = {
    'Total admin': '/super_admin/Slayout/admin-management',
    'Total Teachers': '/super_admin/Slayout/teacher-management',
    'Total parent': '/super_admin/Slayout/student-management',
    'Total Students': '/super_admin/Slayout/student-management',
    'Total Institutions': '/super_admin/Slayout/Institution-management'
  };

  ngOnInit() {
    this.testCountForSuperAdmin();
    this.getexpiringusers();
    this.getExpiredUsers();
    this.allUserForCount();
    this.updatePagination();
    this.initTestsChart();
    this.allAdminForCount();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.filterExpiringUsers();
  }

  filterExpiringUsers() {
    if (!this.expiringUsers || this.expiringUsers.length === 0) {
      this.activeExpiringUsers = [];
      return;
    }

    this.activeExpiringUsers = this.expiringUsers.filter((user: any) => {
      const daysLeft = Number(user.daysLeft);
      return daysLeft > 0;
    });

    console.log('activeExpiringUsers', this.activeExpiringUsers);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Refresh data when switching tabs
    if (tab === 'expiring') {
      this.getexpiringusers();
    } else if (tab === 'expired') {
      this.getExpiredUsers();
    }
  }

  openExpiryDateModal(user: any) {
    this.selectedUser = user;
    const expiryDate = new Date();

    if (user.daysLeft && user.daysLeft > 0) {
      expiryDate.setDate(expiryDate.getDate() + user.daysLeft);
    } else if (user.expiryDate) {
      const parsedDate = new Date(user.expiryDate);
      if (!isNaN(parsedDate.getTime())) {
        expiryDate.setTime(parsedDate.getTime());
      }
    }

    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const day = String(expiryDate.getDate()).padStart(2, '0');
    this.newExpiryDate = `${year}-${month}-${day}`;
    this.showExpiryDateModal = true;
  }

  testCountForSuperAdmin() {
    this.http.getRequest(`api/test/count/${sessionStorage.getItem('superadminId')}`).subscribe((res: any) => {
      this.testGenerate = res;
      this.initTestsChart();
    })
  }

  closeModal(event: Event) {
    const target = event.target as HTMLElement;
    if (
      target.classList.contains('modal-overlay') ||
      target.closest('.close-btn') ||
      target.closest('.cancel-btn') ||
      target.closest('.modal-close')
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
    let obj = { userId, expiryDate };
    console.log({ obj });

    this.http.putRequest('api/auth/update-expiry', obj).subscribe(
      (response) => {
        this.toastr.success('User expiry date updated successfully');
        
        // Refresh both lists after update
        this.refreshAllUserLists();
        
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

  // New method to refresh both user lists
  refreshAllUserLists() {
    // Refresh expiring users
    this.getexpiringusers();
    
    // Refresh expired users
    this.getExpiredUsers();
    
    // Also refresh the counts/stats if needed
    this.allUserForCount();
  }

  getexpiringusers() {
    this.isLoadingExpiring = true;
    const superadminId = sessionStorage.getItem('superadminId');

    if (!superadminId) {
      console.error('Super Admin ID not found in sessionStorage');
      this.toastr.error('Authentication error. Please login again.');
      this.isLoadingExpiring = false;
      this.expiringUsers = [];
      this.filterExpiringUsers();
      return;
    }

    this.http.getRequest(`api/auth/expiring-users/${superadminId}`).subscribe(
      (res: any) => {
        this.expiringUsers = res || [];
        console.log('expiringUsers', this.expiringUsers);
        this.total = this.expiringUsers.length;
        this.filterExpiringUsers();
        this.updateDisplayData();
        this.isLoadingExpiring = false;
      },
      (err) => {
        console.log('Error fetching expiring users:', err);
        this.expiringUsers = [];
        this.filterExpiringUsers();
        this.isLoadingExpiring = false;

        if (err.status === 400) {
          this.toastr.error('Unable to fetch expiring users. Please check your credentials.');
        } else {
          this.toastr.error('Failed to load expiring users data.');
        }
      }
    );
  }

  // Updated method to fetch expired users from the API
  getExpiredUsers() {
    this.isLoadingExpired = true;
    const superadminId = sessionStorage.getItem('superadminId');

    if (!superadminId) {
      console.error('Super Admin ID not found in sessionStorage');
      this.toastr.error('Authentication error. Please login again.');
      this.isLoadingExpired = false;
      this.expiredUsers = [];
      return;
    }

    this.http.getRequest(`api/auth/expired-users/${superadminId}`).subscribe(
      (res: any) => {
        this.expiredUsers = res || [];
        console.log('expiredUsers from API', this.expiredUsers);
        this.isLoadingExpired = false;
      },
      (err) => {
        console.log('Error fetching expired users:', err);
        this.expiredUsers = [];
        this.isLoadingExpired = false;

        if (err.status === 400) {
          this.toastr.error('Unable to fetch expired users. Please check your credentials.');
        } else if (err.status === 404) {
          console.log('No expired users found');
          this.expiredUsers = [];
        } else {
          this.toastr.error('Failed to load expired users data.');
        }
      }
    );
  }

  // Method to manually remove a user from expired list after update
  removeUserFromExpiredList(userId: string) {
    if (this.expiredUsers && this.expiredUsers.length > 0) {
      this.expiredUsers = this.expiredUsers.filter(user => user.userId !== userId);
    }
  }

  // Method to manually remove a user from expiring list after update
  removeUserFromExpiringList(userId: string) {
    if (this.expiringUsers && this.expiringUsers.length > 0) {
      this.expiringUsers = this.expiringUsers.filter(user => user.userId !== userId);
      this.filterExpiringUsers(); // Re-filter after removal
      this.updateDisplayData(); // Update pagination data
    }
  }

  private getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'graded':
        return 'blue';
      case 'excellent':
        return 'purple';
      case 'pending':
        return 'orange';
      default:
        return 'grey';
    }
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.updateDisplayData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updateDisplayData();
  }

  updateDisplayData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.expiringUsers.slice(start, end);
  }

  get filteredSales() {
    return this.salesData.filter(sale =>
      Object.values(sale).some((value: any) =>
        value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  navigateTo(title: string): void {
    const route = this.titleToRouteMap[title];
    if (route) {
      this.router.navigate([route]);
    }
  }

  initTestsChart(): void {
    const chartDom = document.getElementById('testsGeneratedChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
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
    window.addEventListener('resize', () => {
      if (myChart) {
        myChart.resize();
      }
    });
  }

  ngAfterViewInit() {
    this.initTestsChart();
  }

  allUserForCount() {
    this.http.getRequest(countsforsuperadminAPI).subscribe((response) => {
      console.log({ allUserForCount: response });
      this.userStats = response;
    })
  }

  allAdminForCount() {
    this.http.getRequest(activationcountsAPI).subscribe((response) => {
      console.log({ allAdminForCount: response });
      this.activationCards = response;
    })
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSales = this.salesData.slice(startIndex, endIndex);
    console.log('paginatedSales', this.paginatedSales);
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
    this.charts.testsChart = new Chart('testsChart', {
      type: 'bar',
      data: {
        labels: ['Teachers', 'Students'],
        datasets: [{
          label: '',
          data: [this.testGenerate.teacher, this.testGenerate.student],
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
          mode: 'nearest',
          intersect: true,
        },
      }
    });
  }

  updateCharts(newData: any) {
    Object.keys(this.charts).forEach(chartKey => {
      if (this.charts[chartKey] && newData[chartKey]) {
        this.charts[chartKey].data = newData[chartKey];
        this.charts[chartKey].update();
      }
    });
  }

  ngOnDestroy() {
    Object.values(this.charts).forEach((chart: any) => {
      if (chart) {
        chart.destroy();
      }
    });
  }
}