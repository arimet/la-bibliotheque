// Corbenic on the shelf: its story, and the picture drawn for each page.
import type { PageFilm } from "../canvas-core/west";
import { c01 } from "../canvas-core/c01";
import { c02 } from "../canvas-core/c02";
import { c03 } from "../canvas-core/c03";
import { c04 } from "../canvas-core/c04";
import { c05 } from "../canvas-core/c05";
import { c06 } from "../canvas-core/c06";
import { c07 } from "../canvas-core/c07";
import { c08 } from "../canvas-core/c08";
import { c09 } from "../canvas-core/c09";
import { c10 } from "../canvas-core/c10";
import { c11 } from "../canvas-core/c11";
import { c12 } from "../canvas-core/c12";
import { placeholder } from "../canvas-core/placeholder";
import { book } from "../stories/corbenic";
import { reader } from "./reader";

const DRAWN: Record<string, PageFilm> = { c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11, c12 };
// the placeholder's sepia sheet stands in for vellum until a page is drawn
reader(book, (p) => DRAWN[p.id] ?? placeholder(p.id, p.title, 0));
