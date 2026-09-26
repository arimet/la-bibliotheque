// A book is data: its pages, what can be carried, and where it starts. The reader plays any of them.
export type Choice = { to: string; label: string; card?: string; needs?: string };
// `tone` 0..1 is how far the book has turned (Dust Creek: sepia → cyanotype, Corbenic: gold → blood)
export type Page = { id: string; n: number; title: string; text: string[]; gives?: string; tone?: number; ending?: boolean; choices: Choice[] };
export type Book = { id: string; name: string; start: string; startItems: string[]; items: Record<string, { name: string; icon: string }>; pages: Page[] };

export const pageIn = (b: Book, id: string) => b.pages.find((p) => p.id === id);
export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
// the stylesheet knows three stages of a book's turn
export const toneOf = (p: Page): 0 | 1 | 2 => { const t = p.tone ?? 0; return t < 0.5 ? 0 : t < 0.9 ? 1 : 2; };
