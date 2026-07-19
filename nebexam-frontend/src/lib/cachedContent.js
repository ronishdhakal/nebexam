import { cache } from 'react';
import { chaptersService } from '@/services/chapters.service';
import { subjectsService } from '@/services/subjects.service';
import { areasService } from '@/services/areas.service';
import { entriesService } from '@/services/questionbank.service';
import { blogService } from '@/services/news.service';
import { newsService } from '@/services/news.service';

// Server-only cached data fetchers — wrapped in React's cache() so a
// generateMetadata call and its page component share exactly one request
// per unique argument, instead of double-fetching the same resource.
const safe = (promise) => promise.then((r) => r.data).catch(() => null);

export const getChapter = cache((slug) => safe(chaptersService.getOne(slug)));

export const getChapterImportantQuestions = cache((slug) =>
  safe(chaptersService.getImportantQuestions(slug)).then((d) => d || [])
);

export const getSubject = cache((slug) => safe(subjectsService.getOne(slug)));

export const getSubjectsForLevel = cache((level) =>
  safe(subjectsService.getAll({ class_level: level })).then((d) => d?.results ?? d ?? [])
);

export const getAreasForSubject = cache((subjectSlug) =>
  safe(areasService.getAll({ subject: subjectSlug })).then((d) => d || [])
);

export const getChaptersForSubject = cache((subjectSlug) =>
  safe(chaptersService.getAll({ subject: subjectSlug })).then((d) => d || [])
);

export const getQuestionBankEntries = cache((subjectSlug) =>
  safe(entriesService.getAll({ subject: subjectSlug })).then((d) => d?.results ?? d ?? [])
);

export const getQuestionBankEntry = cache((slug) => safe(entriesService.getOne(slug)));

export const getBlogPost = cache((slug) => safe(blogService.getOne(slug)));

export const getNewsPost = cache((slug) => safe(newsService.getOne(slug)));
