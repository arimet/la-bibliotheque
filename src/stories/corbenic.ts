// The whole book as data. Only a type import: the story graph test reads this file with plain Node.
import type { Book, Page } from "../app/book";
export type Item = "epee" | "cierge" | "cle" | "graal";

export const START = "c01";
export const START_ITEMS: Item[] = ["epee"];
// icons are 24x24 line drawings, stroked in the page's ink
const svg = (d: string) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ITEMS: Record<Item, { name: string; icon: string }> = {
  epee: { name: "l'épée", icon: svg('<path d="M12 2.5l1.6 2.2V15h-3.2V4.7z"/><path d="M7.5 15h9M12 15v4.2"/><circle cx="12" cy="20.5" r="1.2"/>') },
  cierge: { name: "le cierge béni", icon: svg('<path d="M9.5 9h5v10h-5z"/><path d="M12 3.2c-1.3 1.5-1.3 3 0 4 1.3-1 1.3-2.5 0-4z"/><path d="M6 19.5h12M11 9v2.5"/>') },
  cle: { name: "la clé à la colombe", icon: svg('<circle cx="6.8" cy="12" r="3.3"/><path d="M10.1 12h11M18 12v3M20.6 12v2.2"/>') },
  graal: { name: "le Graal", icon: svg('<path d="M7 9.5h10c0 3.6-2.2 5.6-5 5.6s-5-2-5-5.6z"/><path d="M8 9.5c.5-2.1 2-3.1 4-3.1s3.5 1 4 3.1M12 3.6v2.8M12 15.1v3.4M8.5 20.5h7"/>') },
};

export const PAGES: Page[] = [
  { id: "c01", n: 1, title: "Le Val stérile", text: [
    "Le chemin descend dans le val de Corbenic entre deux champs de blé que personne n'a fauchés. On est en septembre, et les épis tiennent encore debout sur leurs tiges, noirs jusqu'au grain. Ton cheval baisse la tête pour en arracher une bouchée, la renifle et la recrache.",
    "Tu portes sur toi l'ordre du roi, fermé de son sceau : « Rapporte-moi le Graal. » C'est Keu, le sénéchal, qui te l'a remis. Arthur ne s'est pas assis à la Table ronde depuis la chasse de Pâques, et Keu dit qu'il a la fièvre. Ce matin-là, Keu avait la main gauche bandée, et il la tenait serrée contre sa poitrine. Un chien, a-t-il dit.",
    "Tu n'es pas le premier. Perceval est parti il y a un an, et depuis Pâques, Keu a envoyé dix chevaliers après lui. Aucun n'est revenu, t'a dit Keu. À Camelot, le Siège Périlleux attend toujours : on le garde vide pour le chevalier qui rapportera le Graal.",
    "Au bas du chemin, il y a un village. Toutes les portes sont condamnées par des planches, et les clous ont été plantés du dehors. <em>Du dehors. On a enfermé quelqu'un là-dedans.</em> Une seule fenêtre est éclairée, celle de la chapelle. Derrière le muret du cimetière, quelque chose cogne contre du bois, à coups lents et réguliers.",
  ], choices: [{ to: "c02", label: "Frapper à la chapelle" }, { to: "c03", label: "Enjamber le muret" }] },

  { id: "c02", n: 2, title: "La Chapelle", gives: "cierge", text: [
    "Tu frappes. Derrière la porte, un verrou glisse et un judas s'ouvre à hauteur de visage. « Montre tes mains. Les deux. Retourne-les. » Tu obéis. L'homme regarde longtemps tes poignets avant de t'ouvrir.",
    "Il s'appelle frère Blaise. Il a barricadé la chapelle avec les bancs, et il dort au pied de l'autel, sous une rangée de cierges allumés. « Ici, les morts ne restent pas morts. Celui qui meurt dans le val se relève la nuit suivante. Celui qu'ils mordent meurt dans la journée, et il se relève aussi. » Il montre du menton la fenêtre, et les portes clouées de l'autre côté de la place. « Ceux-là, on les a enfermés chez eux quand ils ont été mordus. Ils y sont toujours. »",
    "« Ça a commencé il y a vingt ans, quand le roi Pêcheur a été blessé, là-haut, dans son château. Il ne peut pas mourir, et depuis, plus rien ne meurt comme il faut sur sa terre. Pas même le blé. » Il prend un cierge sur l'autel et te le met dans la main. « Béni à la Chandeleur. Ils ont peur de ce feu-là. Je les ai vus reculer devant l'autel. »",
    "« Le Graal est au château de Corbenic, avec le roi. D'autres chevaliers sont montés avant toi. Je les ai vus passer. » Il ne dit pas s'il les a vus redescendre, et tu ne lui poses pas la question.",
  ], choices: [{ to: "c04", label: "Monter au château" }] },

  { id: "c03", n: 3, title: "Le Cimetière", gives: "cle", text: [
    "Tu enjambes le muret. Une tombe sur deux est ouverte. Personne ne les a creusées : la terre a été repoussée de l'intérieur, et elle a roulé en tas autour des trous.",
    "Le bruit vient du fond. Un homme en armure est enchaîné à une grande croix de bois. Il se jette en avant, encore et encore, et à chaque fois, la chaîne le ramène en arrière et sa tête cogne contre la croix. Tu reconnais l'armure vermeille avant le visage. Perceval. Pendant trois ans, vous avez mangé côte à côte à la Table ronde. Il a la peau grise, les yeux blancs, et sa bouche s'ouvre et se ferme sur rien.",
    "Il a au cou une entaille qui va jusqu'à l'os. Quelqu'un a essayé de le tuer, et ça ne l'a pas arrêté. Alors on l'a attaché.",
    "Il tire toujours dans la même direction : vers le bout du val, où se dresse le château de Corbenic. <em>Il continue sa quête.</em> À sa ceinture pend une longue clé, avec une colombe gravée sur l'anneau. Pour la prendre, il faut passer à portée de ses dents. Tu attends qu'il se jette en avant, et quand la chaîne le plaque contre la croix, tu tends la main.",
  ], choices: [{ to: "c04", label: "Prendre la route du château" }] },

  { id: "c04", n: 4, title: "Corbenic", tone: 0.3, text: [
    "Le château de Corbenic est posé sur un rocher, au bout du val. Le pont-levis est baissé. Au-dessus de la grande porte, quelqu'un a sculpté une colombe dans la pierre.",
    "Du haut de la route, tu vois par-dessus le mur d'enceinte. La cour est pleine d'hommes debout, qui ne bougent presque pas. Ils portent des cottes de mailles et des écus, et sur les écus, tu reconnais des armoiries que tu as vues peintes aux murs de Camelot : le lion d'Yvain, les merlettes de Lamorak. Ce sont les chevaliers de la Table ronde. Ceux que Keu a envoyés avant toi.",
    "Ils sont tous tournés vers la même porte, au fond de la cour, celle du donjon. <em>Ils sont venus chercher le Graal. Ils le cherchent encore.</em>",
    "Pour entrer, il y a la grande porte, et donc la cour. Ou bien le puits sec, au pied du rocher : il en sort un air froid qui sent la cave. Il débouche quelque part sous le château.",
  ], choices: [{ to: "c05", label: "Passer la grande porte" }, { to: "c06", label: "Descendre dans le puits" }] },

  { id: "c05", n: 5, title: "La Cour", tone: 0.5, text: [
    "Tu passes sous la voûte, l'épée à la main. Les morts ne se retournent pas. Tu marches entre eux, assez près pour sentir leur odeur de viande restée au soleil. Ils regardent la porte du donjon.",
    "Yvain est au premier rang. C'est lui qui t'a appris à tenir une lance, dans la lice de Camelot, l'année de tes douze ans. Il lui manque la moitié du visage. Un corbeau est posé sur son épaule, et il ne le chasse pas.",
    "Un mort se tourne vers toi. Puis un deuxième. Tu frappes le premier à l'épaule, de toutes tes forces, et la lame descend jusqu'à la poitrine. Il tombe. Il se relève. <em>Ils ne meurent pas une deuxième fois.</em>",
    "À gauche, un escalier monte dans la tour, là où doit se trouver la chambre du roi. Devant toi, derrière la porte du donjon, des voix chantent, très bas, toujours les trois mêmes notes.",
  ], choices: [{ to: "c07", label: "Monter dans la tour" }, { to: "c08", label: "Suivre les chants" }] },

  { id: "c06", n: 6, title: "La Crypte", tone: 0.5, text: [
    "Tu descends le puits par les barreaux scellés dans la pierre, ta torche entre les dents. En bas, un couloir voûté s'enfonce dans le rocher. Les murs sont creusés de niches, et dans chaque niche, un mort est couché, enveloppé dans un drap.",
    "Ceux-là ne bougent pas. Ils sont là depuis longtemps : les draps sont gris de poussière, et les os percent le tissu. Tu passes quand même le plus loin possible des niches.",
    "Au bout du couloir, une grille ferme un escalier qui monte. Elle a une serrure, et sur la plaque de la serrure, une colombe est gravée. Sur le côté part un autre escalier, sans grille. D'en haut descend un chant, très bas, toujours les trois mêmes notes.",
  ], choices: [{ to: "c07", label: "Ouvrir la grille", needs: "cle" }, { to: "c08", label: "Monter vers le chant" }] },

  { id: "c07", n: 7, title: "Le Roi Pêcheur", gives: "graal", tone: 0.6, text: [
    "L'escalier débouche dans une chambre. Il y fait chaud, et l'odeur te prend à la gorge avant que tes yeux s'habituent à la pénombre. Un vieil homme est couché dans un grand lit. Sa cuisse est bandée, et le linge est noir et mouillé.",
    "« Je suis Pellès. En bas, on m'appelle le roi Pêcheur. » Il parle lentement, et il s'arrête entre les phrases. « Une lance m'a blessé il y a vingt ans. Depuis, je ne guéris pas et je ne meurs pas. Et sur ma terre, plus rien ne meurt comme il faut. »",
    "Sur une table, près du lit, il y a une coupe d'or avec un couvercle. Rien d'autre. <em>C'est ça, le Graal ?</em> « Le Graal rend à chacun ce qui lui revient. Au vivant, la vie. Au mort, sa mort. Moi, je ne suis ni l'un ni l'autre, et je ne peux plus lever les bras. » Il te regarde. « Perceval est venu, l'an dernier. Il a vu la coupe, et il est reparti sans rien me demander. »",
    "Alors tu lui demandes ce qu'il veut. « Boire. » Tu soulèves le couvercle et tu lui tiens la coupe. Il boit, il repose la tête, et sa poitrine s'arrête. Par la fenêtre, tu vois tout le blé noir du val se coucher d'un coup. Tu remets le couvercle. Camelot attend le Graal.",
  ], choices: [{ to: "c09", label: "Rentrer à Camelot" }] },

  { id: "c08", n: 8, title: "Le Cortège", gives: "graal", tone: 0.7, text: [
    "Tu entres dans la grande salle au moment où le cortège passe. Un jeune homme en tunique blanche ouvre la marche. Il porte une lance à deux mains, et du fer de la lance, une goutte de sang coule le long de la hampe jusqu'à ses doigts. Une autre goutte se forme déjà à la pointe.",
    "Derrière lui viennent deux filles qui portent des chandeliers, puis une troisième, qui tient à hauteur de poitrine une coupe d'or couverte. Ce sont elles qui chantent les trois notes, la bouche fermée. Ils sont morts, tous les quatre. Ils font le tour de la salle, et quand ils reviennent à la porte, ils recommencent.",
    "Tu attends que la porteuse passe devant toi, et tu prends la coupe. Ses doigts ne lâchent pas. Tu tires plus fort, et tu entends ses doigts casser. Le chant s'arrête.",
    "Tout le cortège se tourne vers toi. Au fond de la salle, derrière un rideau, une voix d'homme crie : « Non ! Donne-la-moi ! » Tu ne t'arrêtes pas pour voir qui c'est. Tu cours vers la sortie, le Graal serré contre toi, et derrière toi, des pas se mettent à suivre.",
  ], choices: [{ to: "c09", label: "Rentrer à Camelot" }] },

  { id: "c09", n: 9, title: "Camelot", tone: 1, text: [
    "Tu mets trois semaines à rentrer. Plus tu approches de Camelot, plus il y a de morts sur les routes. Des paysans, un marchand, une fille de cuisine avec son tablier. À deux lieues des murs, tu en croises un qui porte la livrée du roi.",
    "La porte de Camelot est ouverte, et personne ne la garde. Dans la grande salle, les chevaliers sont assis autour de la Table ronde, chacun à sa place, les mains à plat devant eux. Ils ont la peau grise. Sagremor est là, le cou ouvert. Il est parti en mai chercher le Graal, et Keu t'a dit qu'aucun n'était revenu. Le Siège Périlleux est vide.",
    "Keu vient à ta rencontre. Il marche lentement, et sa main gauche pend hors du bandage, noire. Il s'incline devant toi, à la manière d'un sénéchal qui accueille un chevalier de retour, puis il t'ouvre la porte de la chambre du roi.",
    "Arthur est assis sur son lit, la couronne sur la tête. Sa mâchoire bouge sans arrêt, sur rien. À son poignet droit, il y a une morsure noire, avec la marque de chaque dent. <em>La chasse de Pâques. Il n'a jamais eu la fièvre.</em> Le roi tourne la tête vers toi, et il se lève.",
  ], choices: [
    { to: "c10", card: "Le Graal", label: "Lui tendre la coupe", needs: "graal" },
    { to: "c11", card: "Le Cierge", label: "Allumer le cierge", needs: "cierge" },
    { to: "c12", card: "L'Épée", label: "Tirer l'épée", needs: "epee" },
  ] },

  { id: "c10", n: 10, title: "Le Repos", tone: 0.2, ending: true, text: [
    "Tu soulèves le couvercle et tu tends la coupe. Arthur ne la prend pas : il y plonge la bouche, et ses dents claquent contre l'or. Il boit.",
    "Il arrête de mâcher. Il te regarde, et pour la première fois depuis que tu es entré, il cligne des yeux. Puis ses jambes plient, et il se couche sur le côté, au pied de son lit, la couronne de travers. Il ne bouge plus.",
    "Tu fais le tour de la Table avec la coupe. Sagremor boit, et il se couche. Puis les autres, un par un. Keu boit le dernier. La coupe n'est jamais vide.",
    "Au matin, tu portes le roi jusqu'au lac, et tu le couches dans une barque. Le brouillard la prend avant qu'elle soit au milieu de l'eau. Tu rentres à Camelot. Il y a des chevaliers à enterrer, et sur les routes, des morts qui attendent la coupe.",
  ], choices: [] },

  { id: "c11", n: 11, title: "Le Bûcher", tone: 1, ending: true, text: [
    "Tu allumes le cierge de frère Blaise à la torche du couloir. Arthur s'arrête à trois pas de la flamme, puis il recule. Dans la salle, les chevaliers se sont levés, et eux aussi reculent quand tu passes.",
    "Tu mets le feu aux tentures. Puis aux bancs, à la paille du sol, aux bannières accrochées au-dessus de la Table. Le bois de la salle a trois cents ans, et il prend vite. Les morts ne crient pas. Ils reculent devant ton cierge jusqu'au fond de la salle, et le feu les y rejoint.",
    "Tu sors, et tu tires la grande porte derrière toi. Du haut de la colline, tu regardes Camelot brûler toute la nuit. Vers le matin, le toit de la grande salle s'effondre sur la Table ronde.",
    "Le Graal est toujours dans ta sacoche. Sur la route, un mort qui porte la livrée du roi marche vers toi. Tu descends de cheval, et tu soulèves le couvercle.",
  ], choices: [] },

  { id: "c12", n: 12, title: "La Table ronde", tone: 1, ending: true, text: [
    "Tu tires l'épée et tu frappes au cou, de toutes tes forces. La tête d'Arthur roule sous le lit, avec la couronne. Le corps fait encore un pas vers toi.",
    "Sous le lit, la tête continue de mâcher. Derrière toi, dans la salle, toutes les chaises raclent le sol en même temps.",
    "Ils sont vingt. Tu en tiens trois à distance, puis quatre. Sagremor t'attrape le bras qui tient l'épée, et Keu, de sa main noire, te tient la tête pendant que les autres te mordent. Tu meurs avant le soir.",
    "La nuit suivante, tu vas t'asseoir à la Table ronde. Keu a posé le Graal devant le Siège Périlleux, celui qu'on gardait vide pour le chevalier qui le rapporterait. C'est là que tu t'assois, les mains à plat sur la table.",
  ], choices: [] },
];

export const book: Book = { id: "corbenic", name: "Corbenic", start: START, startItems: START_ITEMS, items: ITEMS, pages: PAGES };
