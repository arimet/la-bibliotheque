// Les Grands Bois on the shelf: its story, and the picture drawn for each page.
import type { PageFilm } from "../canvas-core/west";
import { f01 } from "../canvas-core/f01";
import { f02 } from "../canvas-core/f02";
import { f03 } from "../canvas-core/f03";
import { f04 } from "../canvas-core/f04";
import { f05 } from "../canvas-core/f05";
import { f06 } from "../canvas-core/f06";
import { f07 } from "../canvas-core/f07";
import { f08 } from "../canvas-core/f08";
import { f09 } from "../canvas-core/f09";
import { f10 } from "../canvas-core/f10";
import { f11 } from "../canvas-core/f11";
import { f12 } from "../canvas-core/f12";
import { placeholder } from "../canvas-core/placeholder";
import { book } from "../stories/grands-bois";
import { reader } from "./reader";

const DRAWN: Record<string, PageFilm> = { f01, f02, f03, f04, f05, f06, f07, f08, f09, f10, f11, f12 };
reader(book, (p) => DRAWN[p.id] ?? placeholder(p.id, p.title, 0));
