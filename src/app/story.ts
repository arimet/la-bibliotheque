// The whole book as data. No imports: the story graph test reads this file on its own.
export type Item = "revolver" | "lanterne" | "etoile" | "cristal";
export type Choice = { to: string; label: string; card?: string; needs?: Item };
export type Page = { id: string; n: number; title: string; text: string[]; gives?: Item; blue?: number; ending?: boolean; choices: Choice[] };

export const START = "p01";
export const START_ITEMS: Item[] = ["revolver"];
// icons are 24x24 line drawings, stroked in the page's ink
const svg = (d: string) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ITEMS: Record<Item, { name: string; icon: string }> = {
  revolver: { name: "le revolver", icon: svg('<path d="M3 8h13l1.5-1.5H21v3.5h-4l-1 1.5H12l-1.5 3.5-1 3.5H5.5l1-4.5L8 11H3z"/><circle cx="13" cy="10.2" r="1.2"/><path d="M10.5 14.5c1 .3 1.8-.2 2-1.3"/>') },
  lanterne: { name: "la lanterne", icon: svg('<path d="M9 5h6M12 2.5V5M8 7h8l-1 2v7l1 2H8l1-2V9z"/><path d="M12 10.5c-1 1.2-1 2.6 0 3.6 1-1 1-2.4 0-3.6z"/><path d="M8 20h8"/>') },
  etoile: { name: "l'étoile de shérif", icon: svg('<path d="M12 3l2.5 5.5 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z"/><circle cx="12" cy="12" r="2"/>') },
  cristal: { name: "le cristal bleu", icon: svg('<path d="M12 2.5l5 5-5 14-5-14z"/><path d="M7 7.5h10M12 2.5v19M9.5 7.5L12 21.5M14.5 7.5L12 21.5"/>') },
};

export const PAGES: Page[] = [
  { id: "p01", n: 1, title: "Dust Creek", text: [
    "À l'entrée de Dust Creek, ton cheval refuse d'aller plus loin que la première maison, et il te faut deux coups de talon pour le remettre au pas. Le soleil vient de passer derrière la mesa. Dans la grand-rue, il n'y a personne, pas même un chien. Un buisson sec traverse les ornières, poussé par le vent.",
    "La mine de Jeb Callahan ne donne plus rien depuis l'an dernier, et les gens s'en vont un par un. Toi, tu es là pour l'avis cloué sur la porte de l'écurie : cinq cents dollars à qui retrouvera le shérif Hollis. Cinquante ans, moustache grise, chapeau gris à bande tressée. Disparu depuis trois jours.",
    "À gauche, quelqu'un massacre une valse sur le piano du saloon. À droite, la porte du bureau du shérif claque contre son chambranle, et personne ne se lève pour la fermer. <em>Pourquoi personne ne la ferme ?</em>",
  ], choices: [{ to: "p02", label: "Pousser les portes battantes" }, { to: "p03", label: "Entrer chez le shérif" }] },

  { id: "p02", n: 2, title: "Le Saloon", gives: "lanterne", text: [
    "Le piano s'arrête au milieu d'une note quand tu pousses les battants. Une douzaine de têtes se tournent vers toi, puis retournent à leur verre. Dans cette ville, personne n'a envie d'être vu en train de parler à un inconnu.",
    "Mae tient le bar. Cinquante ans, des avant-bras de femme qui a roulé des tonneaux toute sa vie. Elle parle sans lever les yeux de son torchon. « Hollis posait des questions sur Jeb Callahan. Chaque nuit, les gars de Jeb montent sur la mesa avec leurs carabines, et ils redescendent avec des caisses. » Le torchon s'arrête. « Une mine à sec, mon grand, ça ne remplit pas des caisses. »",
    "Dans le coin, le vieil Ezra rallume sa pipe. « Ils chassent les lumières. Des bleues, qui tombent du ciel depuis trois nuits. » Il pousse sa lanterne cabossée vers toi. « Si Hollis est quelque part, il est sous la mesa. Y a une autre entrée à la mine, que Jeb a oubliée. Moi pas. »",
  ], choices: [{ to: "p04", label: "Sortir dans la nuit" }] },

  { id: "p03", n: 3, title: "Le Bureau", gives: "etoile", text: [
    "Ça sent le tabac froid. Le cendrier déborde de mégots roulés à la main : ces derniers jours, Hollis a passé ses nuits ici, à fumer et à écrire. Une chaise est renversée, le râtelier est vide.",
    "Son carnet est ouvert sur la table, à la dernière page écrite : « Les cristaux ne viennent pas de la mine. Ils TOMBENT du ciel. Callahan les ramasse sur la mesa et les vend à l'armée. Ce soir, je descends au puits n° 3 voir ce qu'il y cache. » Rien après.",
    "Sous le carnet, il y a son étoile de shérif, posée sur un éclat de verre bleu pas plus gros qu'un ongle. Le laiton est tiède, alors que la pièce est froide. Tu prends l'étoile. C'est à ce moment-là qu'une détonation fait trembler les vitres.",
  ], choices: [{ to: "p04", label: "Courir dehors" }] },

  { id: "p04", n: 4, title: "La Chute", blue: 0.2, text: [
    "Dehors, sur la crête de la mesa, il y a des torches : une demi-douzaine de cavaliers. Deux éclairs de carabine partent vers le ciel, et le bruit n'arrive qu'une seconde plus tard.",
    "Au-dessus d'eux, une lumière bleue, énorme, se met à tomber. Elle traverse les étoiles sans le moindre bruit et disparaît derrière les rochers. Le sol tremble sous tes bottes, et toutes les lampes de Dust Creek s'éteignent en même temps. Là-haut, une lueur se met à battre, lentement, avec des ratés.",
    "Sur la crête, les torches se mettent en marche vers l'endroit où la lumière est tombée : ceux qui ont tiré vont chercher ce qu'ils ont abattu. Tu ne les rattraperas pas par la piste.",
    "Mais la même lueur bleue sort aussi de l'entrée de la vieille mine, au pied de la mesa. Les galeries doivent monter jusque là-haut.",
  ], choices: [{ to: "p05", label: "Grimper vers la lueur" }, { to: "p06", label: "Descendre dans la mine" }] },

  { id: "p05", n: 5, title: "Le Cratère", gives: "cristal", blue: 0.5, text: [
    "Ce n'est pas une météorite. Les météorites n'ont pas de porte.",
    "Au fond du cratère, le sable a fondu en verre, et il craque sous tes bottes. L'engin est planté du nez dans la roche : lisse, sans un rivet ni une vis, aussi long qu'une diligence. Une trappe ovale est ouverte sur le flanc, et la lumière à l'intérieur baisse et remonte, régulièrement.",
    "À tes pieds, un éclat de cristal bleu bat au même rythme. Quand tu approches la main, il bat plus vite. Il est tiède. Tu le ramasses.",
    "Des traînées partent de la trappe vers les rochers : ce qui était à bord est blessé, et s'est mis à l'abri. Plus bas, sur la piste, les torches des cavaliers montent vers toi.",
  ], choices: [{ to: "p07", label: "Suivre les traces" }, { to: "p08", label: "Attendre les cavaliers" }] },

  { id: "p06", n: 6, title: "La Mine", blue: 0.5, text: [
    "La galerie descend dans le noir, et l'air a un goût de fer et d'orage. Les étais sont neufs, les rails aussi. <em>Pour une mine morte, on y travaille beaucoup la nuit.</em>",
    "Tout au fond, une lumière bleue court le long des rails. Elle ne descend pas : elle remonte la pente vers toi. Avec elle vient une respiration, lente et profonde, beaucoup trop profonde pour un homme.",
    "Sans lumière, tu ne feras pas dix pas sans te rompre le cou. Et tu n'as aucune envie que ce qui respire en bas t'entende tomber.",
  ], choices: [{ to: "p07", label: "Allumer la lanterne", needs: "lanterne" }, { to: "p08", label: "Remonter à l'air libre" }] },

  { id: "p07", n: 7, title: "Le Pilote", blue: 1, text: [
    "Il est adossé à la roche, une main plaquée sur le flanc, et une lumière pâle filtre entre ses doigts. Il est grand, beaucoup trop mince, et sa peau grise est presque transparente : tu devines la roche derrière son épaule. Quand il lève la tête vers toi, ses yeux s'allument.",
    "Il n'a pas de bouche. Les images arrivent quand même, directement dans ta tête, et ça fait mal derrière les yeux. Des cristaux posés en ligne dans le noir, des milliers, jusqu'au bout du ciel : c'est la route de son peuple. Des hommes qui les arrachent pour les vendre. Des carabines levées vers lui.",
    "Puis il te montre ce que tu es venu chercher. Il l'a trouvé dans ta tête avant que tu y penses : un puits noyé qu'il a traversé en rampant dans les galeries, et tout au fond, un homme qui garde la tête hors de l'eau, une étoile sur la poitrine. <em>Hollis.</em> Vivant, pour l'instant.",
    "Le pilote montre le ciel, puis tes mains : il lui faut un cristal pour repartir. Sur la piste, les torches approchent.",
  ], choices: [{ to: "p09", label: "Te placer entre lui et les torches" }] },

  { id: "p08", n: 8, title: "Le Gang", blue: 0.6, text: [
    "Ils sont six, à cheval, les carabines en travers de la selle. Celui de tête avance au pas : Jeb Callahan. Bel homme, du genre qui sourit trop. Il porte un chapeau gris à bande tressée, celui que décrit l'avis de l'écurie. <em>Le chapeau de Hollis.</em>",
    "« Tu sais ce qui tombe du ciel, l'ami ? De l'argent. Ma mine est morte, et la ville crève avec. L'armée paie ces cailloux au poids de l'or. Et la machine qu'on vient d'abattre, là-haut ? » Il siffle entre ses dents. « Pour ça, elle paiera ce que je demande. »",
    "Il se penche sur l'encolure. « Le shérif voulait tout arrêter. Il est au fond du puits n° 3. Il réfléchit. » Le sourire s'élargit. « Alors, tu montes avec nous et tu prends ta part, ou tu vas réfléchir avec lui. » Derrière lui, sur la mesa, la lueur bleue faiblit, puis se rallume.",
  ], choices: [{ to: "p09", label: "Soutenir son regard" }] },

  { id: "p09", n: 9, title: "Le Face-à-face", blue: 1, text: [
    "Vous êtes au bord du cratère. D'un côté, Callahan et ses hommes, les carabines levées. De l'autre, l'engin planté dans le sable, sa trappe ouverte, et devant la trappe une silhouette grise, trop mince, qui tient à peine debout. Entre les deux, toi.",
    "Le vent tombe d'un coup. Même les torches arrêtent de claquer. Tu entends un cheval mâcher son mors, et c'est à peu près tout.",
    "Callahan crache dans la poussière. « Alors ? »",
    "Il attend de voir de quel côté tu vas te mettre. Tout ce que tu as sur toi, c'est ce que tu as ramassé en chemin.",
  ], choices: [
    { to: "p10", card: "L'Étoile", label: "Épingler l'étoile", needs: "etoile" },
    { to: "p11", card: "Le Cristal", label: "Lever le cristal", needs: "cristal" },
    { to: "p12", card: "Le Revolver", label: "Dégainer", needs: "revolver" },
  ] },

  { id: "p10", n: 10, title: "Shérif des deux mondes", blue: 1, ending: true, text: [
    "Tu épingles l'étoile de Hollis sur ta veste. Le laiton a passé trois jours posé sur un cristal. Pendant une seconde, il ne se passe rien. Puis l'étoile s'allume, d'un bleu si violent que les chevaux reculent, et dans le cratère la trappe s'illumine en réponse.",
    "Les carabines s'abaissent une à une. Ces hommes ont vu ce que la lumière bleue a fait à la roche du cratère, et aucun n'a envie de savoir ce qu'elle ferait à un homme. Callahan épaule quand même. C'est Dutch, son propre contremaître, qui lui arrache la carabine des mains : il a une femme et deux gosses à Dust Creek, et il tient à les revoir.",
    "À l'aube, tu descends au puits n° 3 avec une corde et une lampe. Hollis remonte maigre et grelottant, mais vivant. Il regarde longtemps l'étoile sur ta poitrine, puis il te la laisse. Les caisses de cristaux de Callahan remontent aussi. La nuit suivante, le pilote repart avec, et il les replace un par un sur sa route.",
    "Depuis, chaque soir, une étoile de plus s'allume au-dessus de la mesa. Tu es le shérif, maintenant. C'est toi qui les comptes.",
  ], choices: [] },

  { id: "p11", n: 11, title: "Le Grand Départ", blue: 1, ending: true, text: [
    "Tu lèves le cristal. Il s'embrase dans ta main sans te brûler, et dans le cratère, l'engin se met à vibrer. Le pilote te tend sa main longue et grise. Personne ne t'attend nulle part, et il le sait : il a lu en toi. Tu la prends.",
    "La trappe se referme sur vous deux, et le vaisseau quitte le cratère sans un bruit. En bas, les carabines de Callahan tirent dans le vide. Tu vois les éclairs rapetisser, puis tu ne les vois plus.",
    "Le pilote pose deux doigts sur ta tempe, et tu vois une dernière image : Mae et le vieil Ezra qui remontent Hollis du puits n° 3. Il leur a montré, à eux aussi, où chercher. Mae pleure. Ezra fait semblant que non.",
    "Puis Dust Creek n'est plus qu'un point. Devant vous, les balises se rallument une à une, en deux lignes droites qui filent vers le fond du ciel. Une grand-rue. Et cette fois, il y a quelqu'un au bout.",
  ], choices: [] },

  { id: "p12", n: 12, title: "Le Dernier Duel", ending: true, text: [
    "Tu dégaines le premier. Callahan tombe sans un mot, et ses hommes s'enfuient dans la nuit sans même ramasser son chapeau.",
    "Mais une balle est allée plus loin que les autres. Tu l'entends frapper quelque chose qui sonne creux. Derrière toi, la lumière de l'engin vacille, rougit, puis s'éteint. Tu attends que le pilote se relève. Tu attends longtemps.",
    "À l'aube, tu descends au puits n° 3. L'eau est montée pendant la nuit, jusqu'en haut des échelles. Tu remontes seul, avec le chapeau de Hollis dans la main. Le comté te paie la moitié de la prime : tu as ramené le chapeau, pas le shérif.",
    "Tu repars vers l'ouest avec deux cent cinquante dollars. Certaines nuits, quand tu lèves les yeux, tu cherches une étoile qui n'est plus là.",
  ], choices: [] },
];

export const pageById = (id: string) => PAGES.find((p) => p.id === id);
