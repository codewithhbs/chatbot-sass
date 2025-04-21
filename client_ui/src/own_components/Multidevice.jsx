import { Badge } from '@/components/ui/badge'
import { Laptop, MessageSquare, Phone, Tablet } from 'lucide-react'
import React from 'react'

const Multidevice = () => {
  return (
    <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
          Cross-Platform
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Works on Any Device</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ChatWave provides a seamless experience across all devices and platforms
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <div className="col-span-3 md:col-span-1 flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-3 mb-4">
              <Laptop className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Desktop</h3>
            <p className="text-center text-gray-600 text-sm">
              Full-featured experience on desktop browsers
            </p>
          </div>
          <div className="col-span-3 md:col-span-1 flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-3 mb-4">
              <Tablet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tablet</h3>
            <p className="text-center text-gray-600 text-sm">
              Optimized for touch interfaces on tablets
            </p>
          </div>
          <div className="col-span-3 md:col-span-1 flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-3 mb-4">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mobile</h3>
            <p className="text-center text-gray-600 text-sm">
              Responsive design for all mobile devices
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-xl p-4 md:p-8 relative">
          <div className="flex flex-wrap justify-center items-end gap-4 md:gap-8">
            <div className="w-full md:w-1/2 lg:w-1/3 transform transition-transform hover:scale-105 duration-300">
              <div className="bg-gray-100 rounded-t-lg p-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-b-lg p-4 h-64 bg-white">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">ChatWave Assistant</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    How can I help you today?
                  </div>
                  <div className="bg-blue-600 text-white rounded-lg p-2 text-sm ml-auto max-w-[80%]">
                    I'd like to learn more about your pricing plans.
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    I'd be happy to explain our pricing plans...
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-20 h-40 bg-gray-800 rounded-xl border-4 border-gray-900 transform transition-transform hover:scale-105 duration-300">
              <div className="h-full bg-white rounded-md p-1">
                <div className="bg-blue-600 text-white text-xs p-1 rounded-t-sm flex items-center">
                  <MessageSquare className="h-2 w-2 mr-1" />
                  <span className="truncate">ChatWave</span>
                </div>
                <div className="p-1 space-y-1">
                  <div className="bg-gray-100 rounded-sm p-0.5 text-[6px]">
                    How can I help?
                  </div>
                  <div className="bg-blue-600 text-white rounded-sm p-0.5 text-[6px]">
                    Pricing info?
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-32 h-56 bg-gray-800 rounded-xl border-8 border-gray-900 transform transition-transform hover:scale-105 duration-300">
              <div className="h-full bg-white rounded-sm p-1">
                <div className="bg-blue-600 text-white text-xs p-1 rounded-t-sm flex items-center">
                  <MessageSquare className="h-2 w-2 mr-1" />
                  <span className="truncate">ChatWave</span>
                </div>
                <div className="p-1 space-y-1">
                  <div className="bg-gray-100 rounded-sm p-1 text-[8px]">
                    How can I help you today?
                  </div>
                  <div className="bg-blue-600 text-white rounded-sm p-1 text-[8px]">
                    I need support.
                  </div>
                  <div className="bg-gray-100 rounded-sm p-1 text-[8px]">
                    I'm here to help!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Multidevice