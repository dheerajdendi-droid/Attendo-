import { formatMonth } from "./date.js";

export function buildInvoiceMessage({
  studentName,
  month,
  sessions,
  rate,
  amount,
  studioName = "your studio",
  currencySymbol = "£",
}) {
  const monthLabel = formatMonth(month);
  return (
    `Hi! This is ${studioName}.\n\n` +
    `${studentName}'s class fees for ${monthLabel}:\n` +
    `${sessions} session${sessions === 1 ? "" : "s"} × ${currencySymbol}${rate.toFixed(2)} = ${currencySymbol}${amount.toFixed(2)}\n\n` +
    `Thank you! 🙏`
  );
}

export function waLink(phone, message) {
  const digits = (phone || "").replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}
