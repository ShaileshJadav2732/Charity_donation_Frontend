'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // If user is authenticated, redirect to dashboard or complete profile
    if (isAuthenticated) {
      if (user?.profileCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/complete-profile');
      }
    }
  }, [isAuthenticated, user, router]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative bg-blue-600 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Make a Difference with Your Donation
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
            Connect with charitable organizations and contribute to causes you care about.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="ml-4 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform makes charitable giving simple and transparent.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">Create an Account</h3>
                <p className="mt-4 text-gray-500">
                  Sign up as a donor or an organization to get started.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">Complete Your Profile</h3>
                <p className="mt-4 text-gray-500">
                  Tell us about yourself or your organization.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900">Start Donating</h3>
                <p className="mt-4 text-gray-500">
                  Find causes you care about and make a difference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Ready to make a difference?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Join our platform today and start contributing to causes you care about.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Charity Donation Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
