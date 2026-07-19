// Flattens a subject's areas/chapters into a single ordered list — used for
// the chapter sidebar, prev/next navigation, and "more chapters" blocks.
export function flattenSubjectChapters(areas, directChapters) {
  if (areas?.length > 0) {
    return areas.flatMap((area) =>
      (area.chapters || []).map((ch) => ({ ...ch, area_name: area.name }))
    );
  }
  return (directChapters || []).map((ch) => ({ ...ch, area_name: null }));
}
