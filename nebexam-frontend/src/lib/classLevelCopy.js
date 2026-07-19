// Class-level copy is data-driven: Class 10 is SEE (no streams), Class 11/12
// split into Science & Management streams, Class 8/9 are foundation levels.
export function classMetaCopy(level) {
  if (level === '10') {
    return {
      title: 'Class 10 (SEE) Notes, Question Bank & Past Papers — NEB Exam',
      description: 'Class 10 SEE notes, important questions and past question papers for all subjects. Prepare for your Secondary Education Examination with NEB Exam.',
    };
  }
  if (level === '11' || level === '12') {
    return {
      title: `Class ${level} Notes (Science & Management) — NEB Exam`,
      description: `Class ${level} notes, past papers and model questions for Science and Management streams. Browse all subjects for NEB exam preparation.`,
    };
  }
  return {
    title: `Class ${level} Notes — NEB Exam`,
    description: `Class ${level} notes, important questions and study resources for NEB exam preparation.`,
  };
}
