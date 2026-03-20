/**
 * Utility functions for the project
 */

/**
 * Calculate estimated reading time for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to short string
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Sort posts by date (descending)
 */
export function sortByDate<T extends { data: { pubDate?: Date; date?: Date } }>(
  posts: T[]
): T[] {
  return posts.sort((a, b) => {
    const dateA = a.data.pubDate || a.data.date;
    const dateB = b.data.pubDate || b.data.date;
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Get a short description from markdown content
 */
export function getDescription(content: string, maxLength: number = 160): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/m, '');
  // Remove markdown syntax
  const plainText = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/[*_#~]/g, '') // markdown symbols
    .replace(/\n+/g, ' ') // newlines
    .trim();

  if (plainText.length <= maxLength) return plainText;

  return plainText.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
