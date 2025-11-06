import { MetadataRoute } from 'next';
import { getCourses } from '@/lib/data';
import { getAcademicData } from '@/lib/academics';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://studyscript.netlify.app';

  // 1. Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/quizzes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/games`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/free-notes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/bookstore`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/audio-lectures`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/live-classes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // 2. Dynamic course pages
  const courses = await getCourses();
  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.docId}`,
    lastModified: new Date(), // Ideally, you'd use a date from your course data
    changeFrequency: 'weekly' as 'weekly',
    priority: 0.9,
  }));

  // 3. Dynamic academic pages (classes, subjects, chapters)
  const academicClasses = await getAcademicData();
  const academicRoutes = academicClasses.flatMap((ac) => {
    const classUrl = {
      url: `${baseUrl}/class/${ac.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 0.8,
    };

    const subjectUrls = (ac.subjects || []).flatMap((subject) => {
      const subjectUrl = {
        url: `${baseUrl}/class/${ac.id}/${subject.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as 'weekly',
        priority: 0.8,
      };

      const chapterUrls = (subject.chapters || []).map((chapter) => ({
        url: `${baseUrl}/class/${ac.id}/${subject.id}/${chapter.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as 'monthly',
        priority: 0.7,
      }));

      return [subjectUrl, ...chapterUrls];
    });

    return [classUrl, ...subjectUrls];
  });

  return [...staticRoutes, ...courseRoutes, ...academicRoutes];
}
