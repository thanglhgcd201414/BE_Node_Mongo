enum EOrderStatus {
  PROCESSING = "PROCESSING",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

enum EPaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

enum EPaymentMethod {
  CAST = "CAST",
  BANK_TRANSFER = "BANK_TRANSFER",
}

enum EOrderReviewed {
  NOT_REVIEWED = "NOT_REVIEWED",
  REVIEWED = "REVIEWED",
}

export { EOrderStatus, EPaymentStatus, EPaymentMethod, EOrderReviewed };
