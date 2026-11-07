// WhatsApp message builder. Always identifies the sender and offers an opt-out (Spam Act 2003).
import { IT_BRAND } from '@/data/site';
import type { Lead } from './types';

export const SENDER_NAME = 'Asad';
export const COMPANY = IT_BRAND;

function opener(lead: Pick<Lead, 'websiteStatus'>): string {
  switch (lead.websiteStatus) {
    case 'none':
      return "noticed you don't have a website yet";
    case 'social_only':
      return 'noticed your business is only on social media, without its own website';
    case 'weak':
      return 'had a look at your website and saw a few quick wins';
    default:
      return 'saw a few ways you could save time answering customers';
  }
}

const SERVICE_PHRASE: Record<string, string> = {
  Website: 'a proper website',
  'Online booking': 'online booking',
  'AI website chat agent': 'an AI chat agent on your website',
  'WhatsApp auto-replies': 'WhatsApp auto-replies',
  'Facebook & Instagram DM automation': 'automatic Facebook and Instagram message replies',
  'Missed-call text-back': 'automatic texts when you miss a call',
  'Google review automation': 'getting more Google reviews automatically',
  'Social media post automation': 'automated social media posts',
  'Quote & invoice automation': 'automatic quotes and invoices',
};

function naturalList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function buildMessage(lead: Pick<Lead, 'name' | 'websiteStatus' | 'services' | 'pitch'>): string {
  const services = lead.services.length
    ? naturalList(lead.services.map((s) => SERVICE_PHRASE[s] ?? s))
    : 'a website and AI tools';
  return [
    `Hi ${lead.name}, ${SENDER_NAME} here from ${COMPANY} in Brisbane.`,
    `I came across your business on Google and ${opener(lead)}.`,
    `We help small businesses with ${services}, so you get more bookings and customers get replies 24/7, even when you're busy.`,
    `Happy to build you a free demo, no obligation. Websites start from $150.`,
    `Not interested? Just reply STOP and I won't message again.`,
  ].join('\n\n');
}

export function whatsappLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
