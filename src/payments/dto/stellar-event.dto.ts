export interface StellarEventDto {
  eventId: string
  txHash?: string
  orderId?: string
  destinationAddress?: string
  amount?: string
  memo?: string
  payload?: Record<string, unknown>
}
