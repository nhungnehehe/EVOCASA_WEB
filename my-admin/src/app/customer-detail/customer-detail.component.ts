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
    this.loadCustomers();
    this.route.paramMap.subscribe(params => {
      const customerId = params.get('id');
      if (customerId) {
        this.displayCustomerDetails(customerId);
        this.fetchOrders(customerId);
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe(
      (data) => {
        this.customers = data;
        this.totalCustomers = data.length;
        this.updateDisplayedCustomer();
      },
      (error) => {
        console.error('Error fetching customers:', error);
      }
    );
  }

  updateDisplayedCustomer(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const customer = this.customers[startIndex];
    if (customer) {
      this.displayedCustomer = customer;
    }
  }

  displayCustomerDetails(customerId: string): void {
    const customer = this.customers.find(c => c._id === customerId);
    if (customer) {
      this.displayedCustomer = customer;  // Hiển thị chi tiết khách hàng theo ID
    }
  }

  // loadCustomerOrders(orderId: string): void {
  //   this.orderService.getOrdersByCustomer(orderId).subscribe(
  //     orders => {
  //       this.orders = orders;  // Display orders associated with the customer
  //     },
  //     error => console.error('Error fetching orders:', error)
  //   );
  // }

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
  

  // Pagination: change the page
  changePage(page: number): void {
    this.currentPage = page;
    this.updateDisplayedCustomer();
    this.router.navigate([`/customer-detail/${this.customers[(page - 1)]._id}`]);  // Điều hướng theo ID của khách hàng
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
