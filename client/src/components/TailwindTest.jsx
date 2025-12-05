import React from 'react';

const TailwindTest = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full p-8 bg-white rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold text-center text-blue-600 mb-6'>
          Tailwind CSS is Working! 🎉
        </h1>
        <div className='space-y-4'>
          <div className='p-4 bg-blue-100 text-blue-800 rounded-md'>
            <p className='font-medium'>
              This is a test component using Tailwind CSS
            </p>
          </div>
          <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'>
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
