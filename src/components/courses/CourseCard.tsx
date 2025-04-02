import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Course } from '../../services/courseService';
import { getStorageUrl } from '../../lib/utils';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-white rounded-[5px] shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="aspect-video w-full overflow-hidden">
        <LazyLoadImage
          src={getStorageUrl(course.thumbnail_url)}
          alt={course.title}
          effect="blur"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
          threshold={300}
        />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-primary mb-2">{course.title}</h2>
        <p className="text-secondary text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-secondary text-sm">
            <Clock className="h-4 w-4 mr-1" strokeWidth={1.5} />
            <span>{course.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center text-primary">
            <ChevronRight className="h-4 w-4 ml-1" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(CourseCard);