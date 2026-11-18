// Sample class review data that is added to Firestore.
// After you've signed into SRJC Class Reviews, click the dropdown
// menu in the top right corner and select "Add sample classes".

export const semester = [
  "Fall 2024",
  "Spring 2025",
  "Fall 2025",
  "Spring 2026",
];

// Department and sample units are tied to each course code.
export const classes = [
  { name: "CS 82.2A", category: "Computer Science", units: 3 },
  { name: "CS 82.2B", category: "Computer Science", units: 3 },
  { name: "CS 50A", category: "Computer Science", units: 3 },
  { name: "CS 82.58", category: "Computer Science", units: 3 },
  { name: "CS 81.41A", category: "Computer Science", units: 3 },
  { name: "CS 180.3", category: "Computer Science", units: 3 },
  { name: "CS 181.2", category: "Computer Science", units: 3 },
  { name: "CS 181.3", category: "Computer Science", units: 3 },
  { name: "BIO 10", category: "Biology", units: 3 },
  { name: "MUSC 8", category: "Music", units: 3 },
  { name: "MUSC 10", category: "Music", units: 3 },
  { name: "ENGL 1A", category: "English", units: 4 },
  { name: "HIST 17.2", category: "History", units: 3 },
  { name: "HIST 17.1", category: "History", units: 3 },
  { name: "LIR 10", category: "Information Literacy", units: 1 },
  { name: "ATHL 27", category: "Athletics", units: 3 },
  { name: "ATHL 1", category: "Athletics", units: 3 },
  { name: "ATHL 3", category: "Athletics", units: 3 },
];

export const classNames = classes.map((course) => course.name);

export const classCategories = [
  "Computer Science",
  "Biology",
  "Music",
  "English",
  "History",
  "Information Literacy",
  "Athletics",
];

export const classReviews = [
  {
    text: "The lectures were clear and the assignments actually helped me learn.",
    rating: 5,
  },
  { text: "Excellent professor and a well organized course.", rating: 5 },
  {
    text: "I understood the material and felt prepared for every exam.",
    rating: 5,
  },
  { text: "One of the best classes I have taken at SRJC.", rating: 5 },
  { text: "Helpful feedback and a manageable workload.", rating: 5 },
  {
    text: "The projects were challenging in a good way and very relevant.",
    rating: 5,
  },
  { text: "Class discussions made the subject click for me.", rating: 5 },
  {
    text: "I would recommend this course to anyone in the major.",
    rating: 5,
  },
  {
    text: "Strong class overall, though a few assignments felt rushed.",
    rating: 4,
  },
  {
    text: "Good lectures and a fair exam. I would take another course with this professor.",
    rating: 4,
  },
  { text: "I learned a lot. The workload was heavy near midterms.", rating: 4 },
  { text: "The class was fine, but nothing about it stood out.", rating: 3 },
  {
    text: "Lectures were uneven. Some weeks were helpful and some were not.",
    rating: 3,
  },
  {
    text: "I passed, though the assignments did not always match the exams.",
    rating: 3,
  },
  {
    text: "The workload was heavier than the credit seemed to justify.",
    rating: 2,
  },
  { text: "Lectures were hard to follow and the exam felt unfair.", rating: 2 },
  {
    text: "I left several classes more confused than when I arrived.",
    rating: 2,
  },
  { text: "Expectations were unclear and grades came back late.", rating: 2 },
  {
    text: "The course was disorganized and I did not learn what the catalog promised.",
    rating: 1,
  },
  {
    text: "Feedback was rare and the final did not match what we covered.",
    rating: 1,
  },
  {
    text: "I would not recommend this class based on my semester.",
    rating: 1,
  },
  {
    text: "Poor communication and assignments that never got returned.",
    rating: 1,
  },
  { text: "Outstanding instruction and fair grading.", rating: 5 },
  {
    text: "The syllabus was clear and every week built on the last.",
    rating: 5,
  },
  {
    text: "I learned more here than in any other class this year.",
    rating: 5,
  },
  {
    text: "Office hours were useful and the professor was easy to reach.",
    rating: 5,
  },
  {
    text: "Engaging lectures and assignments that matched the exams.",
    rating: 5,
  },
  { text: "A standout course with practical skills I still use.", rating: 5 },
  {
    text: "The pace was just right and the content was interesting.",
    rating: 5,
  },
  {
    text: "Highly recommend. I left the semester confident in the material.",
    rating: 5,
  },
  {
    text: "Clear explanations, with a couple of confusing lab days.",
    rating: 4,
  },
  {
    text: "Useful course. Group work could have been organized better.",
    rating: 4,
  },
  { text: "Enjoyed the material and the grading was fair.", rating: 4 },
  {
    text: "Solid class. I wanted a little more practice before the final.",
    rating: 4,
  },
  { text: "Well taught, even if the reading load was high.", rating: 4 },
  {
    text: "Average experience. The content was okay and the pace was slow.",
    rating: 3,
  },
  {
    text: "Decent course, but feedback on work took a long time.",
    rating: 3,
  },
  {
    text: "I learned the basics. It did not leave a strong impression.",
    rating: 3,
  },
  {
    text: "The material was dry and the assignments felt like busywork.",
    rating: 2,
  },
  {
    text: "Not the class I hoped for. I struggled to stay engaged.",
    rating: 2,
  },
  { text: "Instructions for major projects were incomplete.", rating: 2 },
  { text: "I would look for a different section next time.", rating: 2 },
];
