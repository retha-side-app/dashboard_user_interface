import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Course } from '../../services/courseService';
import { getStorageUrl } from '../../lib/utils';

interface CourseHeroProps {
  course: Course;
}

const CourseHero: React.FC<CourseHeroProps> = ({ course }) => {
  return (
    <div className="lg:col-span-2">
      <div className="aspect-video w-full overflow-hidden rounded-[5px] mb-8">
        <LazyLoadImage
          src={getStorageUrl(course.thumbnail_url)}
          alt={course.title}
          effect="blur"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
          threshold={300}
        />
      </div>
      
      <div className="bg-white rounded-[5px] shadow-sm p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">{course.title}</h1>

        <div className="flex items-center space-x-6 mb-8 text-secondary">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" strokeWidth={1.5} />
            <span>{course.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" strokeWidth={1.5} />
            <span>{new Date(course.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-primary mb-4">About this course</h2>
          <p className="text-secondary">{course.description}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseHero);