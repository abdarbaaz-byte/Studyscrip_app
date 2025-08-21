// A script to seed the database with initial data.
// This is for development purposes only.
// To run: npm run db:seed

import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { courses } from '../lib/courses';
import { initialClasses } from '../lib/academics';

async function seedData() {
  // Seed Courses
  const coursesCollection = collection(db, 'courses');
  const coursesSnap = await getDocs(coursesCollection);
  if (coursesSnap.empty) {
      console.log('Seeding courses...');
      const courseBatch = writeBatch(db);
      courses.forEach(course => {
          const docRef = doc(db, 'courses', course.id); // Use the mock ID as the document ID
          courseBatch.set(docRef, course);
      });
      await courseBatch.commit();
      console.log('Courses seeded.');
  } else {
      console.log('Courses collection already has data. Skipping seed.');
  }

  // Seed Academics
  const academicsCollection = collection(db, 'academics');
  const academicsSnap = await getDocs(academicsCollection);
  if (academicsSnap.empty) {
    console.log('Seeding academics...');
    const academicsBatch = writeBatch(db);
    initialClasses.forEach(ac => {
        const docRef = doc(db, 'academics', ac.id); // Use mock ID
        academicsBatch.set(docRef, ac);
    });
    await academicsBatch.commit();
    console.log('Academics seeded.');
  } else {
    console.log('Academics collection already has data. Skipping seed.');
  }
}

async function main() {
    await seedData();
}

main().catch(console.error).finally(() => {
    console.log("Seeding complete. Exiting script.");
    process.exit(0);
});
