import React from 'react';
import { ContactDetailsType } from '../types';

interface ContactDetailsProps {
  contactDetails: ContactDetailsType;
  websiteTitle: string;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ contactDetails, websiteTitle }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-blue-100 dark:border-blue-900">
        <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-3">
          {contactDetails.message}
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-1 flex-shrink-0">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {contactDetails.contact_details.address}
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-1 flex-shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <div>
              {contactDetails.contact_details.phone_numbers.map((phone, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 text-sm">{phone}</p>
              ))}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-1 flex-shrink-0">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {contactDetails.contact_details.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          {contactDetails.button_options.map((btn, i) => (
            <a
              key={i}
              href={
                btn.type === 'phone' ? `tel:${btn.number}` :
                  btn.type === 'email' ? `mailto:${btn.email}` :
                    btn.link
              }
              target={btn.type === 'map' ? "_blank" : "_self"}
              rel={btn.type === 'map' ? "noopener noreferrer" : ""}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-lg transition-colors text-sm"
            >
              {btn.label === 'Call Us' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              )}
              {btn.label === 'Email Us' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              )}
              {btn.label === 'View on Map' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              )}
              {btn.label}
            </a>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Thank you for choosing {websiteTitle}!</p>
      </div>
    </div>
  );
};

export default ContactDetails;