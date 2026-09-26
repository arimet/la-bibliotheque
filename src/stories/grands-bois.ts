// The whole book as data. Only a type import: the story graph test reads this file with plain Node.
import type { Book, Page } from "../app/book";
export type Item = "sifflet" | "echarpe" | "gland";

export const START = "f01";
export const START_ITEMS: Item[] = ["sifflet"];
// icons are 24x24 line drawings, stroked in the page's ink
const svg = (d: string) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ITEMS: Record<Item, { name: string; icon: string }> = {
  sifflet: { name: "le sifflet de Grand-mère", icon: svg('<path d="M3.5 10h10l6 3.5-1.5 3-6.5-2H3.5z"/><circle cx="16.8" cy="13.6" r="1.2"/><path d="M6 10V8.2"/>') },
  echarpe: { name: "l'écharpe de Tom", icon: svg('<path d="M4 6c4 2 12 2 16 0v4c-4 2-12 2-16 0z"/><path d="M14 10.5l1 9.5h3l-1.5-10"/><path d="M15.5 16h2.5M15 18h3"/>') },
  gland: { name: "le gland d'or", icon: svg('<path d="M7 10.5c0-3 2.2-5 5-5s5 2 5 5z"/><path d="M8 10.5c0 4.5 1.8 8 4 8s4-3.5 4-8"/><path d="M12 5.5V3"/>') },
};

export const PAGES: Page[] = [
  { id: "f01", n: 1, title: "La Lisière", text: [
    "La maison de Grand-mère est la dernière avant les Grands Bois. Ce soir, Grand-mère est à la foire de Saint-Aubin avec la charrette, et elle ne rentrera que demain. Elle t'a laissé ton petit frère, Tom, six ans, et deux règles, qu'elle t'a fait répéter sur le pas de la porte.",
    "« On ne quitte jamais le sentier. Et on ne dit jamais son nom à quelqu'un du bois. » Elle t'a mis dans la main un sifflet en os, lisse à force d'avoir servi. « Si tu te perds, tu siffles. »",
    "Tu ne l'as quitté des yeux qu'une minute, le temps de rentrer le linge. Quand tu te retournes, Tom est au bout du pré, près des premiers arbres, et devant lui trotte un renard blanc. Tu cries son nom. Tom se retourne, il rit, et il entre dans le bois derrière le renard.",
    "Le soleil touche les collines. Le sentier entre dans le bois à gauche du pré. Les traces du renard et celles de Tom entrent tout droit, là où il n'y a pas de sentier.",
  ], choices: [{ to: "f02", label: "Prendre le sentier" }, { to: "f03", label: "Suivre les traces" }] },

  { id: "f02", n: 2, title: "Le Sentier", gives: "echarpe", tone: 0.1, text: [
    "Le sentier est couvert de feuilles, et elles craquent si fort sous tes pas que tu t'arrêtes, de temps en temps, pour écouter. Tu n'entends rien. Pas un oiseau. À la maison, il y a un quart d'heure, les merles chantaient encore.",
    "Dans un roncier, au bord du sentier, pend l'écharpe de Tom. Grand-mère l'a tricotée l'hiver dernier, en laine rouge, et elle a brodé TOM au bout, en fil blanc. Elle brode un nom sur tout ce qu'elle tricote pour ses petits-enfants. « Comme ça, ça revient », dit-elle.",
    "À côté du roncier, les petites traces de Tom quittent le sentier, et celles du renard avec. Tu ramasses l'écharpe. Tu restes sur le sentier, parce que Grand-mère l'a dit, et parce qu'il s'enfonce dans le bois du même côté.",
  ], choices: [{ to: "f04", label: "Continuer sur le sentier" }] },

  { id: "f03", n: 3, title: "Le Terrier", gives: "gland", tone: 0.15, text: [
    "Les traces te mènent entre des fougères plus hautes que toi. <em>Grand-mère a dit : jamais.</em> Tu continues quand même, parce que Tom est passé par là.",
    "Au creux d'un talus, devant un trou entre deux racines, un blaireau est assis sur son derrière. Il te regarde arriver sans bouger. « Tu cherches le petit ? Il est passé avec le renard. » Il parle, et il a une voix de garçon, une voix qui n'a pas encore mué.",
    "Il gratte la terre et te tend un gland lourd, jaune, qui brille. « Pour le Vieux Chêne. C'est là qu'ils vont, tous. Il aime qu'on lui apporte quelque chose. » Puis il penche la tête. « Et toi, comment tu t'appelles ? »",
    "Tu revois Grand-mère sur le pas de la porte, et tu ne réponds pas. Le blaireau attend. Puis il rentre dans son trou, et du fond, tu entends un long soupir.",
  ], choices: [{ to: "f04", label: "Continuer" }] },

  { id: "f04", n: 4, title: "La Clairière", tone: 0.35, text: [
    "La nuit tombe quand tu arrives dans une clairière. L'herbe y est rase, et tout autour, assises en rond, il y a des bêtes : des lapins, deux chevreuils, un sanglier, une fouine. Elles ne s'enfuient pas. Elles te regardent.",
    "D'habitude, les bêtes bougent : elles broutent, elles se grattent, elles dressent l'oreille. Celles-là restent assises, et leurs têtes tournent en même temps que tu marches.",
    "Autour du cou d'un lapin, il y a un bout de laine bleue, noué deux fois. La laine est vieille et sale, et personne n'a pu la nouer à part quelqu'un qui a des doigts.",
    "D'un côté, on entend la rivière. De l'autre, le bois devient noir tout de suite.",
  ], choices: [{ to: "f05", label: "Descendre vers la rivière" }, { to: "f06", label: "Entrer dans le noir" }] },

  { id: "f05", n: 5, title: "La Rivière", tone: 0.5, text: [
    "Un héron gris se tient dans l'eau jusqu'aux genoux. Il tourne la tête vers toi. « Tu veux passer ? Monte. » Il a une voix de fille, qui prononce chaque mot en entier. Tu montes sur son dos, et il traverse la rivière en trois grands pas.",
    "De l'autre côté, il te pose sur les galets. « Le renard a sa tanière là-haut, sous les racines du grand hêtre. La Dame du Bois a sa cabane au bord de l'eau, un peu plus loin. Elle a de la soupe. Elle en a toujours. »",
    "Il ne te demande pas ton nom. Quand tu te retournes, il est toujours là, la tête tournée vers toi.",
  ], choices: [{ to: "f07", label: "Monter à la tanière" }, { to: "f08", label: "Aller à la cabane" }] },

  { id: "f06", n: 6, title: "La Nuit", tone: 0.65, text: [
    "Sous les arbres, il fait si noir que tu ne vois plus tes mains. Tu avances les bras tendus. Une branche te griffe la joue. Tu ne sais plus de quel côté est la clairière.",
    "Deux yeux s'allument devant toi, à hauteur de genou. Le renard blanc. Il ne s'approche pas. Il lève le museau et renifle l'air vers toi, longtemps, à petits coups.",
    "Plus loin, entre les troncs, il y a aussi une lumière jaune, petite, qui ne bouge pas.",
  ], choices: [{ to: "f07", label: "Tendre l'écharpe au renard", needs: "echarpe" }, { to: "f08", label: "Aller vers la lumière" }] },

  { id: "f07", n: 7, title: "La Tanière", tone: 0.75, text: [
    "La tanière est un grand creux sous les racines d'un hêtre, qui sent la terre et le poil chaud. Au fond, quatre renardeaux dorment en boule, et au milieu d'eux, il y a Tom.",
    "Tu t'agenouilles. Il a de la terre sur les joues. Ses oreilles sont devenues pointues, couvertes d'un duvet roux, et elles tressaillent dans son sommeil.",
    "Tu le secoues. Il ouvre les yeux et te regarde longtemps, les sourcils froncés. Tu lui demandes s'il te reconnaît, et il ne répond pas.",
    "À l'entrée de la tanière, le renard blanc attend. Quand tu sors en tenant Tom par la main, il part devant, vers le cœur du bois, et il s'arrête pour vous attendre.",
  ], choices: [{ to: "f09", label: "Suivre le renard" }] },

  { id: "f08", n: 8, title: "La Cabane", tone: 0.75, text: [
    "Une lanterne pend à la porte d'une cabane de rondins. Une vieille femme t'ouvre avant que tu frappes. Elle porte un tablier, et elle a les mains rouges de quelqu'un qui fait la vaisselle à l'eau froide. « Entre, entre. Tu as faim. »",
    "Elle te sert une soupe épaisse qui sent le poireau. Pendant que tu manges, tu regardes les murs. Il y a des clous partout, et à chaque clou, une chose d'enfant : un bonnet, une moufle, une écharpe, un soulier. Des dizaines. Au clou le plus proche de la porte pend un bonnet rouge. Celui de Tom.",
    "« Le petit ? Il est chez le Vieux Chêne. Ils y vont tous, à la fin. » Elle sourit. « Et toi, comment tu t'appelles ? » Tu poses ta cuillère et tu ne dis rien. « Ta grand-mère t'a bien appris », dit la vieille femme, et elle ne sourit plus.",
    "Tu n'as pas parlé de ta grand-mère.",
  ], choices: [{ to: "f09", label: "Aller au Vieux Chêne" }] },

  { id: "f09", n: 9, title: "Le Vieux Chêne", tone: 1, text: [
    "Le Vieux Chêne est au milieu du bois, dans une clairière ronde, et la lune l'éclaire assez pour que tu voies chacune de ses feuilles. Tout autour, assises en rond, il y a les bêtes de la clairière, et d'autres encore, des centaines. Le lapin à la laine bleue est au premier rang.",
    "Tom est allé s'asseoir entre les racines, avec des renardeaux. Quand il tourne la tête vers toi, tu vois ses oreilles rousses, et derrière lui, une queue blanche qui balaie les feuilles.",
    "Alors le Chêne parle. Sa voix vient des feuilles et de la terre sous tes pieds, des deux à la fois. « Chaque enfant qui me dit son nom, je le garde. Le nom reste ici, et l'enfant avec. Le petit m'a dit le sien, au bout du pré, au renard. »",
    "Autour de toi, les bêtes baissent la tête. Le lapin porte la laine bleue qu'il avait au cou le jour où il est entré dans le bois.",
  ], choices: [
    { to: "f10", card: "L'Écharpe", label: "Lire le nom brodé", needs: "echarpe" },
    { to: "f11", card: "Le Gland", label: "Offrir le gland d'or", needs: "gland" },
    { to: "f12", card: "Le Sifflet", label: "Siffler", needs: "sifflet" },
  ] },

  { id: "f10", n: 10, title: "L'Aube", tone: 0.1, ending: true, text: [
    "Tu déplies l'écharpe rouge. Le nom est là, en fil blanc : TOM. Ce nom-là, Tom ne l'a pas dit au Chêne. C'est Grand-mère qui l'a brodé, pour que ça revienne.",
    "Tu passes l'écharpe autour du cou de Tom, et tu lis le nom tout haut. Le Chêne ne répond pas. Ses feuilles bougent, alors qu'il n'y a pas de vent. Les oreilles de Tom rapetissent, la queue blanche n'est plus là, et Tom dit : « J'ai froid. »",
    "Vous rentrez par le sentier. Le ciel devient rose derrière les collines, et les merles recommencent à chanter avant que vous soyez sortis du bois.",
    "Grand-mère rentre à midi. Elle regarde l'écharpe, elle regarde Tom, et elle ne pose pas de question. Le soir, elle brode ton nom sur une écharpe neuve.",
  ], choices: [] },

  { id: "f11", n: 11, title: "L'Échange", tone: 0.6, ending: true, text: [
    "Tu poses le gland d'or entre les racines. Le Chêne se tait longtemps. « Un gland, c'est un début. Un nom contre un nom. »",
    "Tu regardes Tom. Tu penses à Grand-mère, qui rentrera demain avec la charrette et trouvera la maison vide. Alors tu dis ton nom.",
    "Les oreilles de Tom redeviennent des oreilles de petit garçon. Il se lève, il te regarde sans savoir qui tu es, et il part en courant vers le sentier, vers la maison. Toi, tu ne sens plus tes mains. Quand tu baisses les yeux, tu as des sabots fins et noirs.",
    "Au printemps, un petit garçon vient parfois s'asseoir au bout du pré, près des premiers arbres. Une biche sort du bois et reste à le regarder, sans approcher.",
  ], choices: [] },

  { id: "f12", n: 12, title: "Les Pattes", tone: 1, ending: true, text: [
    "Tu portes le sifflet à ta bouche et tu siffles de toutes tes forces, comme Grand-mère te l'a dit.",
    "Grand-mère est à la foire de Saint-Aubin, à trois lieues. Personne ne t'entend, à part le bois. Les bêtes se lèvent toutes ensemble et viennent s'asseoir plus près, jusqu'à te toucher. Elles sont chaudes.",
    "Quelqu'un te demande ton nom, tout doucement. Il est tard, tu as froid, Tom dort contre toi, et tu ne te souviens plus très bien pourquoi il ne fallait pas le dire.",
    "Le matin, dans la clairière, il y a deux renards de plus. Le plus grand a un sifflet d'os pendu au cou, au bout d'une ficelle.",
  ], choices: [] },
];

export const book: Book = { id: "grands-bois", name: "Les Grands Bois", start: START, startItems: START_ITEMS, items: ITEMS, pages: PAGES };
