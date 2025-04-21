import { MessageSquare } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">ChatWave</span>
          </div>
          <p className="mb-4">
            Powerful AI chatbots for your website. Engage visitors, answer questions, and convert leads.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
          <ul className="space-y-2">
            <li>
              <a href="#features" className="hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Integrations
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                API
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Tutorials
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 text-center">
        <p>&copy; {new Date().getFullYear()} ChatWave. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer