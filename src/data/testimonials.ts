export interface Testimonial {
  id: string
  name: string
  suburb: string
  state: string
  rating: number
  text: string
  service: string
  serviceIcon: string
  serviceColor: string
  date: string
  image: string
  verified: boolean
}

export const testimonials: Testimonial[] = []

export const stats = [
  { value: "5★",    label: "Google Rating" },
  { value: "100%",  label: "Client Satisfaction" },
  { value: "3",     label: "Services Offered" },
  { value: "QLD",   label: "Based in Brisbane" }
]
