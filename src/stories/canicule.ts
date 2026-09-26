// The whole book as data. Only a type import: the story graph test reads this file with plain Node.
import type { Book, Page } from "../app/book";
export type Item = "photo" | "briquet" | "cle" | "bande";

export const START = "r01";
export const START_ITEMS: Item[] = ["photo"];
// icons are 24x24 line drawings, stroked in the page's ink
const svg = (d: string) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ITEMS: Record<Item, { name: string; icon: string }> = {
  photo: { name: "la photo de l'affiche", icon: svg('<path d="M5 3.5h14v17H5z"/><path d="M8 17c1-2.6 2.4-4 4-4s3 1.4 4 4"/><circle cx="12" cy="9.5" r="2.2"/>') },
  briquet: { name: "le briquet du Flamingo", icon: svg('<path d="M8 9h8v11.5H8z"/><path d="M8 9V6.5h5V9"/><path d="M14.5 5.5c1.2-1.2 1.4-2.4.6-3.4-.4 1.4-1.6 1.8-1.6 3 0 .5.4.8 1 .4z"/>') },
  cle: { name: "la clé de consigne", icon: svg('<circle cx="7" cy="12" r="3.3"/><path d="M10.3 12h10.5M17.5 12v3M20.3 12v2.2"/><path d="M5.8 11h2.4"/>') },
  bande: { name: "la bande magnétique", icon: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/>') },
};

export const PAGES: Page[] = [
  { id: "r01", n: 1, title: "La Cliente", text: [
    "Juillet 1976. Il fait trente-cinq degrés à sept heures du soir, et le ventilateur de ton bureau brasse le même air depuis midi. Sous ta fenêtre, rue Frochot, les néons ne sont pas encore allumés. Tu as été flic dix ans, dont six à Pigalle. Depuis que tu as rendu ta carte, tu cherches des maris qui ne rentrent pas.",
    "Elle entre sans frapper. Une trentaine d'années, une robe verte, des lunettes de soleil qu'elle garde sur le nez. Elle s'appelle Nadia Kessler. Sa sœur Lili chante au Flamingo, la boîte de Rocco Sanna, boulevard de Clichy, et elle n'est pas rentrée chez elle depuis jeudi. Cinq jours. « La police ne fera rien. On m'a dit que vous en étiez. »",
    "Elle pose cinq billets de cent francs sur ton bureau. Ils sont neufs, et leurs numéros se suivent. Tu lui demandes une photo de sa sœur. Elle sort de son sac la photo de l'affiche du Flamingo : Lili de profil, en robe à paillettes, le micro à la main. <em>Pas une photo de famille. Celle de l'affiche.</em>",
    "Elle te laisse l'adresse de Lili, 12 rue Houdon, et un numéro où la joindre à toute heure. « Et chaque nuit à deux heures, je serai au Sans-Souci, place Pigalle. Si vous avez du nouveau. »",
  ], choices: [{ to: "r02", label: "Aller au Flamingo" }, { to: "r03", label: "Monter rue Houdon" }] },

  { id: "r02", n: 2, title: "Le Flamingo", gives: "briquet", tone: 0.15, text: [
    "Le néon du Flamingo est éteint. Sur la porte, un carton scotché : FERMÉ POUR CONGÉS. En six ans de Pigalle, tu n'as jamais vu Rocco fermer en été, la saison des touristes. La porte de service, dans la cour, n'est pas fermée à clé.",
    "Momo, le barman, essuie des verres dans le noir. « Rocco est en vacances. » Il ne lève pas les yeux. Tu lui demandes depuis quand. « Depuis jeudi. » Lili a disparu jeudi. Tu ne le dis pas. Tu lui dis que sa sœur la cherche, et Momo pose son verre. « Lili n'a pas de sœur. Elle a grandi à l'Assistance, elle le raconte à tout le monde. »",
    "Dans la loge de Lili, il y a des robes sur des cintres, un cendrier plein, du fard sur la coiffeuse, et un briquet rose du Flamingo. À l'intérieur du couvercle, quelqu'un a écrit un numéro de téléphone au stylo bille.",
  ], choices: [{ to: "r04", label: "Ressortir" }] },

  { id: "r03", n: 3, title: "L'Appartement", gives: "cle", tone: 0.15, text: [
    "Au troisième étage du 12 rue Houdon, la porte de Lili n'est pas fermée à clé. Quelqu'un a vidé les tiroirs par terre, éventré le matelas, décollé l'affiche du Flamingo pour regarder derrière. Ce qu'il cherchait est assez petit pour tenir derrière une affiche.",
    "La salle de bains a été fouillée moins soigneusement que le reste. Le panneau sous la baignoire tient avec quatre vis, et deux sont neuves. Tu les dévisses avec la pointe de ton couteau. Collée au carrelage par du sparadrap, il y a une clé plate, avec une étiquette : consigne automatique, gare du Nord, casier 214.",
    "Sur la table de nuit, un seul cadre, renversé. Une petite fille en blouse grise devant un grand bâtiment, à côté d'une religieuse. Au dos, au crayon : « Lili, orphelinat de Montreuil, 1954 ». Il n'y a personne d'autre sur la photo.",
  ], choices: [{ to: "r04", label: "Redescendre" }] },

  { id: "r04", n: 4, title: "La Filature", tone: 0.3, text: [
    "Dehors, il fait nuit et toujours trente degrés. Ta Renault 16 démarre au troisième coup. Une Peugeot 504 grise démarre derrière toi, tourne quand tu tournes, et reste à deux voitures de distance sur le boulevard de Clichy.",
    "Au feu rouge de la place Blanche, elle s'arrête à ta hauteur. Le conducteur regarde droit devant lui, mais tu le reconnais : l'inspecteur Maillard. Il travaillait déjà pour le commissaire Varenne quand tu étais dans la maison. Varenne dirige la brigade mondaine, et la moitié des bars de Pigalle lui remettent une enveloppe chaque mois.",
    "<em>Varenne s'intéresse à une chanteuse disparue.</em> Le feu passe au vert. La 504 ne bouge pas. Elle attend que tu repartes.",
  ], choices: [{ to: "r05", label: "Frapper à sa vitre" }, { to: "r06", label: "Descendre dans le métro" }] },

  { id: "r05", n: 5, title: "Le Quai", tone: 0.45, text: [
    "Tu frappes à la vitre. Maillard la baisse, te regarde un moment, puis ouvre la portière arrière. « Le patron veut te voir. » Vingt minutes plus tard, tu es assis au quai des Orfèvres, en face de Varenne, qui transpire dans une chemisette à manches courtes.",
    "« Laisse tomber cette histoire. » Il ne te demande pas qui t'a engagé. Il sort une bouteille d'un tiroir et ne t'en propose pas. « Et si tu croises Rocco, dis-lui qu'on l'attend. Il paraît qu'il est en vacances. » Tu ne lui as pas parlé de Rocco.",
    "Sur son bureau, sous le cendrier, il y a une carte d'hôtel : hôtel Terminus, boulevard Barbès. Quelqu'un a écrit à côté, au stylo : chambre 9. Varenne se lève pour ouvrir la fenêtre, et il ne voit pas que tu la regardes.",
    "À une heure du matin, on te rend tes clés sur le trottoir.",
  ], choices: [{ to: "r07", label: "Appeler l'hôtel Terminus" }, { to: "r08", label: "Appeler Nadia d'abord" }] },

  { id: "r06", n: 6, title: "Le Métro", tone: 0.45, text: [
    "Tu laisses ta voiture au feu, portière ouverte, et tu descends les marches de la station Blanche. Tu montes dans la première rame, tu en ressors à Pigalle au moment où les portes se ferment, et tu remontes à la surface à Anvers. Personne ne remonte derrière toi.",
    "Au comptoir d'un café, tu achètes un jeton de téléphone. La cabine est au fond, près des toilettes, et il y fait si chaud que le combiné colle à ta main.",
    "Tu n'as qu'un jeton. Il est une heure du matin, et tu as un seul numéro que tu es sûr de pouvoir appeler : celui de ta cliente.",
  ], choices: [{ to: "r07", label: "Composer le numéro du briquet", needs: "briquet" }, { to: "r08", label: "Appeler Nadia" }] },

  { id: "r07", n: 7, title: "Lili", gives: "bande", tone: 0.65, text: [
    "Au bout du fil, une voix d'homme ensommeillée : « Hôtel Terminus, boulevard Barbès. » Tu demandes Lili. Il y a un silence, un déclic, et une voix de femme : « Qui êtes-vous ? » Tu dis ton nom, ton ancien métier, et que tu viens seul. Elle te donne le numéro de sa chambre : le 9.",
    "Elle t'ouvre avec la chaîne mise. Elle est plus petite que sur l'affiche, et elle a une valise ouverte sur le lit. Jeudi, après son tour de chant, elle est montée au bureau de Rocco chercher sa paye. Varenne était là. Rocco a dit non à quelque chose, et Varenne lui a tiré dessus, deux fois. Elle était dans le couloir, derrière le rideau.",
    "« Rocco enregistrait tout ce qui se disait dans son bureau. Le magnétophone est sous le tiroir du bas. Quand ils ont emporté Rocco, je suis entrée et j'ai pris la bande. » Elle sort de la valise une petite bobine dans un bas nylon et te la met dans les mains. « Garde-la. Si on me trouve avec, je suis morte. »",
    "Tu lui parles de Nadia Kessler, de sa sœur qui la cherche. Lili te regarde sans comprendre. « Je n'ai pas de sœur. Je n'ai personne. Ma valise est à la consigne de la gare du Nord, et la clé est restée chez moi. Chez moi, ils y sont allés. » Elle remet la chaîne derrière toi.",
  ], choices: [{ to: "r09", label: "Aller au Sans-Souci" }] },

  { id: "r08", n: 8, title: "La Chambre vide", gives: "bande", tone: 0.65, text: [
    "Nadia décroche à la première sonnerie, alors qu'il est une heure et demie du matin. Tu lui racontes ta soirée. Elle t'écoute sans rien dire, et à la fin c'est elle qui parle de l'hôtel Terminus, boulevard Barbès : une amie de Lili l'y aurait vue. <em>Une amie. Lili n'a personne.</em>",
    "Le veilleur de nuit de l'hôtel Terminus dort sur son comptoir. Dans le registre, arrivée jeudi, chambre 9 : Mlle Martin. La porte de la chambre 9 est ouverte. Le lit est défait, l'armoire vide, et la fenêtre donne sur le métro aérien.",
    "Il fait trop chaud pour que le radiateur ait servi depuis mai, et pourtant sa grille a été dévissée puis remise. Derrière, dans un bas nylon, il y a une petite bobine de bande magnétique. Tu la prends.",
    "Quand tu redescends, une Peugeot 504 grise est garée sur le trottoir d'en face, tous feux éteints. Tu sors par la cour.",
  ], choices: [{ to: "r09", label: "Aller au Sans-Souci" }] },

  { id: "r09", n: 9, title: "Deux heures", tone: 1, text: [
    "À deux heures, place Pigalle, le Sans-Souci sert encore des demis tièdes à des types qui n'ont pas envie de rentrer chez eux. Tu t'assois en terrasse, la bande dans la poche de ta chemise. Tu veux voir le visage de Nadia quand tu lui parleras de sa sœur.",
    "La Peugeot 504 grise se gare en double file devant la terrasse. Maillard est au volant. Nadia descend de l'arrière, et derrière elle, en chemisette, descend Varenne.",
    "Elle retire ses lunettes, pour la première fois. Tu la reconnais : Nadia Kessler, entraîneuse au Carrousel, que tu as arrêtée deux fois en 1971, et qui renseigne Varenne depuis. Varenne ne pouvait pas faire chercher Lili par ses hommes sans que la PJ se demande pourquoi. Il l'a fait chercher par toi, et il t'a payé avec les billets neufs de la caisse de sa brigade.",
    "Varenne s'assoit à ta table et commande un demi. « Alors, cette petite ? »",
  ], choices: [
    { to: "r10", card: "La Bande", label: "Parler de la bande", needs: "bande" },
    { to: "r11", card: "La Clé", label: "Dire qu'elle est partie", needs: "cle" },
    { to: "r12", card: "La Photo", label: "Poser la photo sur la table", needs: "photo" },
  ] },

  { id: "r10", n: 10, title: "La Une", tone: 0.2, ending: true, text: [
    "« La bande de Rocco est chez un journaliste. S'il nous arrive quelque chose, à elle ou à moi, elle paraît dans le journal du lendemain. » C'est faux : elle est dans ta poche, contre ta poitrine, et tu sens ton cœur cogner dessus. Varenne te regarde longtemps. Puis il pose un billet pour son demi et il remonte dans la voiture.",
    "À six heures du matin, tu montes les escaliers de Libération, rue de Lorraine. Un journaliste qui n'a pas dormi non plus emprunte un magnétophone au service photo. Vous écoutez la bande deux fois. La deuxième fois, il ne prend plus de notes.",
    "Trois jours plus tard, c'est en première page. On repêche Rocco dans le canal Saint-Martin. Varenne est suspendu, et Maillard, pour ne pas payer seul, raconte tout ce qu'il sait.",
    "En septembre, le Flamingo rouvre avec Momo derrière le bar. Le premier soir, Lili chante en regardant le fond de la salle, là où tu es assis.",
  ], choices: [] },

  { id: "r11", n: 11, title: "Le Train de nuit", tone: 0.6, ending: true, text: [
    "« Elle est partie ce soir. Par le train. » Varenne te regarde, puis il fait signe à Maillard. Maillard part vers les gares. Varenne finit son demi et s'en va sans rien dire.",
    "Toi, tu as la clé du casier 214. Si Lili veut partir, il lui faut ce qui est dedans, et elle n'a plus la clé. À cinq heures du matin, tu l'attends dans le hall de la gare du Nord, entre les consignes.",
    "Elle arrive à cinq heures vingt, un foulard sur les cheveux. Tu ouvres le casier devant elle : une valise, un passeport, une enveloppe d'argent qu'elle a mis trois ans à mettre de côté. Tu lui donnes la bande avec. À Bruxelles, Varenne ne pourra pas venir la chercher.",
    "Le train de 5 h 48 pour Bruxelles part à l'heure. Varenne garde sa brigade et ses enveloppes. Lili, elle, ne revient pas à Paris.",
  ], choices: [] },

  { id: "r12", n: 12, title: "La Photo", tone: 1, ending: true, text: [
    "Maillard est resté au volant, le moteur tourne, et tu sais qui a ton adresse. Tu poses la photo de l'affiche sur la table, entre les demis. Tu leur dis tout ce que tu sais.",
    "Varenne tend la main, et tu lui donnes aussi la bande. Il la met dans sa poche sans la regarder. Nadia remet ses lunettes. Ils repartent tous les trois dans la 504, et le serveur vient ramasser le verre de Varenne, qu'il n'a pas touché.",
    "Trois jours plus tard, France-Soir publie une photo en page six : une femme repêchée dans le canal Saint-Martin, pas encore identifiée. Le journal a pris la seule photo qu'il avait : celle de l'affiche du Flamingo.",
    "Les cinq billets neufs sont toujours dans ton tiroir. Tu n'y as pas touché.",
  ], choices: [] },
];

export const book: Book = { id: "canicule", name: "Canicule", start: START, startItems: START_ITEMS, items: ITEMS, pages: PAGES };
