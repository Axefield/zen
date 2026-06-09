import type { BaseEntity, EntityStatus, Money } from "../base.js"

export type MonetizationType =
  | "subscription"
  | "product-sale"
  | "consulting"
  | "licensing"
  | "affiliate"
  | "donation"
  | "advertising"

export type BillingInterval = "monthly" | "yearly" | "one-time"

export interface Offer extends BaseEntity {
  name: string
  description: string
  monetizationType: MonetizationType
  price: Money
  interval: BillingInterval
  features: string[]
  status: EntityStatus
}

export interface PricingTier extends BaseEntity {
  name: string
  description: string
  amount: Money
  interval: BillingInterval
  features: string[]
  maxUsers?: number
  maxEvents?: number
  offerIds: string[]
}

export interface Subscription extends BaseEntity {
  offerId: string
  principalId: string
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
}

export interface Transaction extends BaseEntity {
  offerId?: string
  subscriptionId?: string
  principalId: string
  amount: Money
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: string
  invoiceId?: string
  description?: string
}

export interface Invoice extends BaseEntity {
  principalId: string
  number: string
  items: InvoiceItem[]
  subtotal: Money
  tax: Money
  total: Money
  status: "draft" | "sent" | "paid" | "overdue" | "canceled"
  dueDate: string
  paidAt?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: Money
  total: Money
}
