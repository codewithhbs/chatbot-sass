export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface Category {
  category: string;
  description?: string;
}

export interface Service {
  name: string;
  description?: string;
}

export interface ContactDetail {
  address: string;
  phone_numbers: string[];
  email: string;
  map_link: string;
}

export interface ButtonOption {
  label: string;
  type: 'phone' | 'email' | 'map';
  number?: string;
  email?: string;
  link?: string;
}

export interface ContactDetailsType {
  message: string;
  contact_details: ContactDetail;
  button_options: ButtonOption[];
  social_links: Record<string, string>;
}