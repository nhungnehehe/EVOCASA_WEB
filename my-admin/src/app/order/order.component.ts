import { Component } from '@angular/core';
import { Order } from '../interfaces/order';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../interfaces/customer';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  orders: Order[] = [];
  displayedOrders: Order[] = [];
  totalOrders: number = 0;

  customerNames: { [key: string]: string } = {};

  selectedOrder: Order | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 4;

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(
      (data) => {
        this.orders = data;
        this.totalOrders = data.length;
        this.fetchCustomerNames();
        this.updateDisplayedOrders();
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }
  updateDisplayedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedOrders = this.orders.slice(startIndex, endIndex);
  }
   // Pagination: change the page
   changePage(page: number): void {
    this.currentPage = page;
    this.updateDisplayedOrders();
  }

  // Calculate the range of customers to display
  get startOrder(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endOrder(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalOrders ? this.totalOrders : end;
  }

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.itemsPerPage);
  }

  // Fetch customer names based on customer_id and store them temporarily
  fetchCustomerNames(): void {
    this.orders.forEach((order) => {
      // Check if customer name is already fetched, if not, fetch it
      if (!this.customerNames[order.Customer_id]) {
        this.customerService.getCustomerById(order.Customer_id).subscribe(
          (customer: Customer) => {
            this.customerNames[order.Customer_id] = customer.Name; // Store customer name by customer_id
          },
          (error) => {
            console.error('Error fetching customer details:', error);
          }
        );
      }
    });
  }
  viewOrderDetails(id: string): void {
    this.orderService.getOrderById(id).subscribe(
      (data) => {
        this.selectedOrder = data; // Store the selected customer's details
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
    this.router.navigate([`/order-detail/${id}`]);
  }
}
