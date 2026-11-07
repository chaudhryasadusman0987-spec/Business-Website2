// Countries the lead finder can search, with suggested cities and the
// mobile-number pattern used to decide if a business can get a WhatsApp.
// `mobile` is matched against the full international number, digits only.

export interface Country {
  code: string; // ISO 3166-1 alpha-2, also sent to Google as regionCode
  name: string;
  mobile: RegExp;
  cities: string[];
}

export const COUNTRIES: Country[] = [
  {
    code: 'AU',
    name: 'Australia',
    mobile: /^614\d{8}$/,
    cities: [
      'Sunnybank QLD', 'Sunnybank Hills QLD', 'Calamvale QLD', 'Logan QLD', 'Woodridge QLD', 'Springwood QLD',
      'Browns Plains QLD', 'Beenleigh QLD', 'Inala QLD', 'Ipswich QLD', 'Brisbane CBD QLD', 'Gold Coast QLD',
      'Moreton Bay QLD', 'Sunshine Coast QLD', 'Toowoomba QLD', 'Sydney NSW', 'Melbourne VIC', 'Perth WA',
      'Adelaide SA', 'Canberra ACT', 'Hobart TAS', 'Darwin NT',
    ],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    mobile: /^642\d{7,9}$/,
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'],
  },
  {
    code: 'PK',
    name: 'Pakistan',
    mobile: /^923\d{9}$/,
    cities: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Peshawar'],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    mobile: /^9715\d{8}$/,
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain'],
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    mobile: /^9665\d{8}$/,
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar'],
  },
  {
    code: 'QA',
    name: 'Qatar',
    mobile: /^974[3567]\d{7}$/,
    cities: ['Doha', 'Al Wakrah', 'Al Rayyan'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    mobile: /^447\d{9}$/,
    cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Bradford', 'Leicester'],
  },
  {
    // US/CA numbers don't show mobile vs landline, so any number is offered.
    code: 'US',
    name: 'United States',
    mobile: /^1\d{10}$/,
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Dallas', 'Miami'],
  },
  {
    code: 'CA',
    name: 'Canada',
    mobile: /^1\d{10}$/,
    cities: ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Mississauga', 'Ottawa'],
  },
  {
    code: 'IN',
    name: 'India',
    mobile: /^91[6-9]\d{9}$/,
    cities: ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'],
  },
];

export const DEFAULT_COUNTRY = 'AU';

export function countryByCode(code: string | null | undefined): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
