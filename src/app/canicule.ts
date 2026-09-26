// Canicule on the shelf: its story, and the picture drawn for each page.
import type { PageFilm } from "../canvas-core/west";
import { r01 } from "../canvas-core/r01";
import { r02 } from "../canvas-core/r02";
import { r03 } from "../canvas-core/r03";
import { r04 } from "../canvas-core/r04";
import { r05 } from "../canvas-core/r05";
import { r06 } from "../canvas-core/r06";
import { r07 } from "../canvas-core/r07";
import { r08 } from "../canvas-core/r08";
import { r09 } from "../canvas-core/r09";
import { r10 } from "../canvas-core/r10";
import { r11 } from "../canvas-core/r11";
import { r12 } from "../canvas-core/r12";
import { placeholder } from "../canvas-core/placeholder";
import { book } from "../stories/canicule";
import { reader } from "./reader";

const DRAWN: Record<string, PageFilm> = { r01, r02, r03, r04, r05, r06, r07, r08, r09, r10, r11, r12 };
reader(book, (p) => DRAWN[p.id] ?? placeholder(p.id, p.title, 0));
