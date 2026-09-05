import { html } from './encourage-subscription-purchasing.html'

export function getSubject(): string {
  return 'Checking in after one month with Regular Notes'
}

export function getBody(registrationDate: string): string {
  return html(registrationDate, 90, 120)
}
