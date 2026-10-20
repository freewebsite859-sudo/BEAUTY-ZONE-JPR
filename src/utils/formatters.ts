/**
 * BeautyZone Indian Formatting & Business Logic Utilities
 * Strictly conforms to Indian English conventions, INR (paise), DD/MM/YYYY date formats,
 * and 16+ age compliance.
 */

// Format paise (integer) to INR with Indian number formatting (e.g., ₹1,499 or ₹1,25,000)
export function formatINR(paise: number): string {
  if (isNaN(paise) || paise === null || paise === undefined) return '₹0';
  const rupees = Math.floor(paise / 100);

  // Indian number grouping logic (last 3 digits, then groups of 2)
  const rupeesStr = rupees.toString();
  if (rupeesStr.length <= 3) {
    return `₹${rupeesStr}`;
  }

  const lastThree = rupeesStr.substring(rupeesStr.length - 3);
  const otherNumbers = rupeesStr.substring(0, rupeesStr.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `₹${formattedOther},${lastThree}`;
}

// Convert INR Rupees to paise (integer)
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Convert paise to plain rupee number
export function paiseToRupees(paise: number): number {
  return Math.floor(paise / 100);
}

// Calculate 25% advance requirement (ceiling to nearest rupee/paise)
export function calculateAdvance(totalPaise: number, advancePercent: number = 25): {
  advancePaise: number;
  balancePaise: number;
} {
  const advancePaise = Math.ceil((totalPaise * advancePercent) / 100);
  const balancePaise = totalPaise - advancePaise;
  return { advancePaise, balancePaise };
}

// Calculate platform commission (default 1000 bps = 10%)
export function calculateCommission(amountPaise: number, commissionBps: number = 1000): number {
  return Math.floor((amountPaise * commissionBps) / 10000);
}

// Calculate customer age from Date of Birth string (YYYY-MM-DD)
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Format date to Indian standard DD/MM/YYYY
export function formatDateIST(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    // If it's already in DD/MM/YYYY format
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    return String(dateInput);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Generate unique booking code e.g., BZ-MUM-89241
export function generateBookingId(city: string = 'MUM'): string {
  const prefix = (city.slice(0, 3) || 'IND').toUpperCase();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BZ-${prefix}-${randomNum}`;
}

// Generate WhatsApp confirmation message text
export function getWhatsAppConfirmationMessage(params: {
  bookingId: string;
  customerName: string;
  parlourName: string;
  services: string[];
  appointmentDate: string;
  appointmentTime: string;
  advancePaise: number;
  balancePaise: number;
  parlourAddress: string;
}): string {
  return `✨ *BeautyZone Appointment Confirmed!*\n\n` +
    `Hello ${params.customerName},\n` +
    `Your appointment at *${params.parlourName}* is confirmed.\n\n` +
    `📋 *Booking ID:* ${params.bookingId}\n` +
    `💅 *Services:* ${params.services.join(', ')}\n` +
    `📅 *Date:* ${params.appointmentDate}\n` +
    `⏰ *Time:* ${params.appointmentTime} (IST)\n` +
    `📍 *Location:* ${params.parlourAddress}\n\n` +
    `💳 *Payment Summary:*\n` +
    `• 25% Advance Paid: ${formatINR(params.advancePaise)}\n` +
    `• Balance Payable at Salon: ${formatINR(params.balancePaise)}\n\n` +
    `Please arrive 10 minutes prior to your slot. Have a wonderful parlour experience! 🌸`;
}
