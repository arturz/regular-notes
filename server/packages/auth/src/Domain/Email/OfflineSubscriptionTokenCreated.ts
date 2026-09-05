import { html } from './offline-subscription-token-created.html'

export function getSubject(): string {
  return 'Access to your Regular Notes Subscription Dashboard'
}

export function getBody(email: string, offlineSubscriptionDashboardUrl: string): string {
  return html(email, offlineSubscriptionDashboardUrl)
}
