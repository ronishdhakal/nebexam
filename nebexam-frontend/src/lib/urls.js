/**
 * Build the clean URL base path for a subject.
 * e.g. { slug: "chemistry-class-12", class_level: "12" } → "/class-12/chemistry"
 */
export function subjectPath(subject) {
  if (!subject?.slug || !subject?.class_level) return null;
  const level = subject.class_level;
  const nameSlug = subject.slug.replace(new RegExp(`-class-${level}$`), '');
  return `/class-${level}/${nameSlug}`;
}

/**
 * Build the clean URL for a chapter.
 * Requires chapter.subject_slug and chapter.subject_class_level.
 */
export function chapterPath(chapter) {
  if (!chapter?.slug) return '#';
  if (!chapter?.subject_slug || !chapter?.subject_class_level) return `/chapter/${chapter.slug}`;
  const level = chapter.subject_class_level;
  const nameSlug = chapter.subject_slug.replace(new RegExp(`-class-${level}$`), '');
  return `/class-${level}/${nameSlug}/${chapter.slug}`;
}
