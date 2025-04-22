import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900"></div>
      
      {/* Animated Circles */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-300 dark:bg-blue-800 opacity-20 blur-3xl animate-blob"></div>
      <div className="absolute top-3/4 left-3/4 w-[350px] h-[350px] rounded-full bg-purple-300 dark:bg-purple-800 opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-pink-300 dark:bg-pink-800 opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjEuOSAyLjEgMi4xdjIxLjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMThjLTEuMiAwLTIuMS0uOS0yLjEtMi4xVjIwLjFjMC0xLjIuOS0yLjEgMi4xLTIuMWgxOHpNMCA0LjFDMCAyLjkuOSAyIDIuMSAyaDIxLjhjMS4yIDAgMi4xLjkgMi4xIDIuMVYyNGMwIDEuMi0uOSAyLjEtMi4xIDIuMUgyLjFDLjkgMjYgMCAyNS4xIDAgMjRWNC4xem0wIDM0QzAgMzYuOS45IDM2IDIuMSAzNmgyMS44YzEuMiAwIDIuMS45IDIuMSAyLjF2MTkuOGMwIDEuMi0uOSAyLjEtMi4xIDIuMUgyLjFjLTEuMiAwLTIuMS0uOS0yLjEtMi4xVjM4LjF6TTM2IDJjMS4yIDAgMi4xLjkgMi4xIDIuMXYxOS44YzAgMS4yLS45IDIuMS0yLjEgMi4xSDI4YzAgMS4xLS45IDItMiAyaC00Yy0xLjEgMC0yLS45LTItMmgtNmMtMS4yIDAtMi4xLS45LTIuMS0yLjFWNC4xQzEyIDIuOSAxMi45IDIgMTQuMSAySDM2em0xOCAzMmMxLjIgMCAyLjEuOSAyLjEgMi4xdjE5LjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMzRjLTEuMiAwLTIuMS0uOS0yLjEtMi4xVjM0LjFjMC0xLjIuOS0yLjEgMi4xLTIuMWgyMHpNNTQgMmMxLjIgMCAyLjEuOSAyLjEgMi4xdjE5LjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMzRjLTEuMiAwLTIuMS0uOS0yLjEtMi4xVjQuMUMzMS45IDIuOSAzMi44IDIgMzQgMmgyMHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
    </div>
  );
};

export default Background;