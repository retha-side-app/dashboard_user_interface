import React from 'react';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Logo from '../components/layout/Logo';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Courses',
      description: 'Access a wide range of carefully curated courses designed to enhance your learning experience.'
    },
    {
      icon: Users,
      title: 'Interactive Learning',
      description: 'Engage with fellow learners and instructors in a collaborative learning environment.'
    },
    {
      icon: Award,
      title: 'Earn Certificates',
      description: 'Receive recognized certificates upon successful completion of your courses.'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <MainLayout>
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Logo />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                Transform Your Learning Journey
              </h1>
              <p className="mt-6 text-lg leading-8 text-secondary">
                Discover a new way of learning with our interactive platform. Join thousands of students who have already enhanced their skills through our courses.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/login"
                  className="rounded-[5px] bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-6 text-lg leading-8 text-secondary">
                Our platform provides all the tools and resources you need to achieve your learning goals.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex flex-col">
                      <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-primary">
                        <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        {feature.title}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-secondary">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default HomePage;