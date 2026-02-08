
export interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  date: string;
  shippingAddress: string;
}

export const generateReceiptHTML = (orderDetails: OrderDetails): string => {
  const { orderId, customerName, customerEmail, items, total, date, shippingAddress } = orderDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - Order ${orderId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-info { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total { font-weight: bold; font-size: 18px; text-align: right; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Shamsy</h1>
        <h2>Order Receipt</h2>
      </div>
      
      <div class="order-info">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>KSh ${item.price.toLocaleString()}</td>
              <td>KSh ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <p>Total: KSh ${total.toLocaleString()}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for shopping with Shamsy!</p>
        <p>For any inquiries, contact us at support@shamsy.com</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceipt = (orderDetails: OrderDetails): void => {
  const receiptHTML = generateReceiptHTML(orderDetails);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Add download functionality
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = printWindow.document.createElement('a');
    a.href = url;
    a.download = `Receipt-${orderDetails.orderId}.html`;
    a.style.display = 'none';
    printWindow.document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Optional: Auto-print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
