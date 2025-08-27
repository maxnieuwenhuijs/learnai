import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CoursePlayer } from '@/features/course-player/CoursePlayer';

export function CoursePage() {
  return (
    <DashboardLayout>
      <CoursePlayer />
    </DashboardLayout>
  );
}