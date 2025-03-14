import { Component, OnInit } from '@angular/core';
import { Customer } from '../interfaces/customer';
import { CustomerService } from '../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order.service'; 
import { Order } from '../interfaces/order';



@Component({
  selector: 'app-customer-detail',
  standalone: false,
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent {
  customers: Customer[] = [];
  displayedCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 1;
  totalCustomers: number = 0;
  displayedCustomer: Customer | null = null;
  orders: Order[] = []; 
  filteredOrders: any[] = [];
  customerNames: { [key: string]: string } = {};



  constructor(private customerService: CustomerService,  private router: Router, private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    // this.loadCustomers();
    this.route.paramMap.subscribe(params => {
      const customerId = params.get('id');
      if (customerId) {
        this.loadCustomerDetails(customerId); 
        this.fetchOrders(customerId);
      }
    });
  }

  loadCustomerDetails(customerId: string): void {
    this.customerService.getCustomerById(customerId).subscribe(
      (data) => {
        this.selectedCustomer = data;  // Lưu thông tin khách hàng vào biến selectedCustomer
      },
      (error) => {
        console.error('Error fetching customer details:', error);
      }
    );
  }
  

  fetchOrders(customerId: string): void {
    this.orderService.getOrdersByCustomer(customerId).subscribe(
      (response: any) => {
        console.log("Raw API response:", response);
        if (response && response.success && response.data) {
          this.orders = response.data; // Chỉ lấy `data` từ API
        } else {
          this.orders = [];
        }
        console.log('Orders after processing:', this.orders);
      },
      (error) => {
        console.error('Lỗi khi lấy đơn hàng:', error);
      }
    );
  }
  


  get totalPages(): number {
    return Math.ceil(this.totalCustomers / this.itemsPerPage);
  }

  getTotalAmount(): number {
    return this.orders.reduce((total, order) => total + order.TotalPrice, 0);
  }

  getOrderQuantity(order: Order): number {
    return order.OrderProduct.reduce((total, product) => total + product.Quantity, 0);
  }
  
}
