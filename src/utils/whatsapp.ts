import { Order, CartItem, CustomerDetails } from '../types';
import { DELIVERY_CONFIG } from '../config/delivery';

/**
 * Validates a Bangladeshi mobile phone number.
 * Accepts formats like:
 * - 01626523338
 * - +8801626523338
 * - 8801626523338
 * - 01712-345678
 */
export function validateBangladeshiPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Standard Bangladeshi regex
  const regex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

  if (!cleaned) {
    return { isValid: false, formatted: '', error: 'Phone number is required.' };
  }

  if (!regex.test(cleaned)) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01626523338 or 01712345678).',
    };
  }

  // Normalize to 01XXXXXXXXX for display
  let normalized = cleaned;
  if (normalized.startsWith('+880')) {
    normalized = '0' + normalized.slice(4);
  } else if (normalized.startsWith('880')) {
    normalized = '0' + normalized.slice(3);
  }

  return { isValid: true, formatted: normalized };
}

/**
 * Builds the neatly formatted WhatsApp order message string.
 */
export function buildWhatsAppOrderMessage(
  order: {
    orderNumber: string;
    createdAt: string;
    customer: CustomerDetails;
    items: {
      productName: string;
      quantity: number;
      price: number;
      lineTotal: number;
      productImage: string;
      productSlug: string;
    }[];
    subtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    notes?: string;
  },
  originUrl: string = window.location.origin
): string {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveryName =
    order.customer.deliveryArea === 'inside_dhaka'
      ? `${DELIVERY_CONFIG.insideDhaka.name} (৳${DELIVERY_CONFIG.insideDhaka.fee})`
      : `${DELIVERY_CONFIG.outsideDhaka.name} (৳${DELIVERY_CONFIG.outsideDhaka.fee})`;

  let message = `🎨 *DHAKA ART NOOK — NEW ORDER CONFIRMATION*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *Order Ref:* #${order.orderNumber}\n`;
  message += `📅 *Date & Time:* ${formattedDate}\n\n`;

  message += `👤 *CUSTOMER DETAILS:*\n`;
  message += `• *Name:* ${order.customer.fullName}\n`;
  message += `• *Phone:* ${order.customer.phone}\n`;
  message += `• *Delivery Area:* ${deliveryName}\n`;
  message += `• *Shipping Address:* ${order.customer.address}\n`;
  if (order.customer.notes) {
    message += `• *Order Note:* ${order.customer.notes}\n`;
  }
  message += `\n🛒 *ORDER ITEMS (${order.items.length}):*\n`;
  message += `─────────────────────\n`;

  order.items.forEach((item, index) => {
    // Resolve absolute image URL for WhatsApp link preview
    let fullImageUrl = item.productImage;
    if (fullImageUrl.startsWith('/')) {
      fullImageUrl = `${originUrl}${fullImageUrl}`;
    }
    const productUrl = `${originUrl}/#product-${item.productSlug}`;

    message += `${index + 1}. *${item.productName}*\n`;
    message += `   Qty: ${item.quantity} × ৳${item.price} = *৳${item.lineTotal}*\n`;
    message += `   🔗 *Product Link:* ${productUrl}\n`;
    message += `   🖼️ *Image Preview:* ${fullImageUrl}\n\n`;
  });

  message += `─────────────────────\n`;
  message += `💰 *ORDER BREAKDOWN:*\n`;
  message += `• *Items Subtotal:* ৳${order.subtotal}\n`;
  message += `• *Delivery Fee:* ৳${order.deliveryCharge}\n`;
  message += `• *Grand Total:* *৳${order.grandTotal}* (BDT)\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💬 *Confirmation Request:*\n`;
  message += `Hello Dhaka Art Nook team! I would like to confirm this order. Please let me know your payment details (bKash/Nagad/COD) and dispatch schedule. Thank you!`;

  return message;
}

/**
 * Generates the direct WhatsApp click-to-chat URL.
 */
export function getWhatsAppOrderUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `${DELIVERY_CONFIG.whatsapp.waUrlBase}?text=${encoded}`;
}
