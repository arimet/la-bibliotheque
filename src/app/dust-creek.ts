// Dust Creek on the shelf: its story, and the picture drawn for each page.
import type { PageFilm } from "../canvas-core/west";
import { p01 } from "../canvas-core/p01";
import { p02 } from "../canvas-core/p02";
import { p03 } from "../canvas-core/p03";
import { p04 } from "../canvas-core/p04";
import { p05 } from "../canvas-core/p05";
import { p06 } from "../canvas-core/p06";
import { p07 } from "../canvas-core/p07";
import { p08 } from "../canvas-core/p08";
import { p09 } from "../canvas-core/p09";
import { p10 } from "../canvas-core/p10";
import { p11 } from "../canvas-core/p11";
import { p12 } from "../canvas-core/p12";
import { placeholder } from "../canvas-core/placeholder";
import { book } from "../stories/dust-creek";
import { reader } from "./reader";

const DRAWN: Record<string, PageFilm> = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12 };
reader(book, (p) => DRAWN[p.id] ?? placeholder(p.id, p.title, p.tone));
