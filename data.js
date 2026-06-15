/* ============================================================
   SEREINE — data.js
   Tout le contenu de l'application : parcours, séances express,
   bibliothèque émotionnelle, respiration, micro-apprentissages.
   Format des scripts guidés : [secondes_depuis_début, "texte"]
   ============================================================ */

const DATA = {

  /* ---------- MICRO-APPRENTISSAGES ---------- */
  micro: [
    "Vous n'avez pas besoin de faire le vide.",
    "Votre esprit va vagabonder. C'est normal, c'est ce qu'il sait faire.",
    "Chaque retour à la respiration est déjà une réussite.",
    "La régularité compte davantage que la durée.",
    "Trois minutes valent mieux que zéro.",
    "Il n'y a pas de bonne ou de mauvaise méditation.",
    "Remarquer que vous êtes distrait, c'est déjà méditer.",
    "La méditation n'est pas une performance. Personne ne vous note.",
    "Le calme n'est pas l'objectif. C'est parfois un effet secondaire.",
    "Méditer fatigué, agité ou pressé compte autant que méditer détendu.",
    "Votre respiration est toujours là. C'est un point d'ancrage gratuit.",
    "Les pensées sont comme des nuages : elles passent.",
    "S'asseoir, c'est déjà 80 % du travail.",
    "Un esprit agité qui s'observe est plus calme qu'il ne le croit.",
    "Recommencer aujourd'hui est déjà une victoire."
  ],

  /* ---------- PARCOURS DÉBUTANT : 14 SÉANCES ---------- */
  parcours: [
    {
      id: "p1", num: 1, titre: "Découvrir la méditation", duree: 3,
      objectif: "Faire une première expérience simple, sans pression.",
      pedagogie: "La méditation n'est pas faire le vide dans sa tête. Aujourd'hui, vous apprenez le geste de base : vous poser, sentir la respiration, remarquer quand l'esprit part, puis revenir sans vous juger. Si vous pensez beaucoup pendant la séance, ce n'est pas raté : c'est exactement le terrain d'entraînement.",
      script: [
        [0, "Bienvenue dans votre première séance. Installez-vous confortablement, assis, le dos droit mais détendu."],
        [15, "Vous pouvez fermer les yeux, ou simplement baisser le regard."],
        [30, "Prenez une grande inspiration par le nez... et soufflez doucement par la bouche."],
        [45, "Encore une fois. Inspirez... et relâchez."],
        [60, "Maintenant, laissez votre respiration reprendre son rythme naturel. Vous n'avez rien à contrôler."],
        [80, "Remarquez simplement l'air qui entre... et qui sort."],
        [100, "Si une pensée arrive, c'est parfaitement normal. Laissez-la passer, comme un nuage."],
        [125, "Revenez doucement à votre respiration. C'est tout l'exercice."],
        [150, "Encore quelques instants. Juste vous, et votre souffle."]
      ],
      conclusion: "Voilà. Vous venez de méditer. Ce n'était ni mystérieux, ni compliqué. Demain, nous observerons la respiration de plus près."
    },
    {
      id: "p2", num: 2, titre: "Observer sa respiration", duree: 4,
      objectif: "Utiliser la respiration comme point d'ancrage de l'attention.",
      pedagogie: "La respiration sert d'ancre parce qu'elle est toujours là, même dans une journée chargée. Le but n'est pas de mieux respirer ni de respirer profondément : c'est d'apprendre à sentir un détail concret, comme l'air aux narines ou le ventre qui bouge. Dans le quotidien, ce repère vous aidera à revenir au présent en quelques secondes.",
      script: [
        [0, "Installez-vous. Dos droit, épaules relâchées, mains posées sur les cuisses."],
        [15, "Fermez les yeux. Prenez deux grandes respirations pour vous poser."],
        [35, "Laissez maintenant le souffle redevenir naturel."],
        [50, "Portez votre attention sur l'air qui entre par vos narines. Est-il frais ? Tiède ?"],
        [75, "Suivez le trajet de l'air... jusqu'à la poitrine... jusqu'au ventre."],
        [100, "Sentez le ventre qui se soulève à l'inspiration... et qui redescend à l'expiration."],
        [130, "Choisissez l'endroit où la respiration est la plus nette pour vous : narines, poitrine ou ventre."],
        [160, "Restez là. Respiration après respiration."],
        [190, "Si l'esprit s'échappe, c'est normal. Ramenez-le doucement, sans vous juger."],
        [215, "Encore quelques respirations, en silence."]
      ],
      conclusion: "Vous avez trouvé votre ancre. Elle sera toujours là, dans chaque séance et dans chaque journée."
    },
    {
      id: "p3", num: 3, titre: "Comprendre les distractions", duree: 5,
      objectif: "Découvrir que se distraire fait partie de la méditation.",
      pedagogie: "Aujourd'hui, vous n'essayez pas de rester concentré sans interruption. Vous entraînez le moment précis où vous remarquez que l'esprit est parti, puis où vous revenez. Si cela arrive 20 fois, ce n'est pas 20 échecs : c'est 20 répétitions utiles. Ce geste servira ensuite au travail, en conversation ou face à une émotion.",
      script: [
        [0, "Installez-vous et fermez les yeux. Prenez une grande respiration."],
        [20, "Posez votre attention sur le souffle, à l'endroit que vous avez choisi hier."],
        [45, "Aujourd'hui, votre esprit va se distraire. C'est prévu, et c'est même le sujet de la séance."],
        [70, "Quand vous remarquez que vous pensez à autre chose, notez-le simplement : « pensée »."],
        [100, "Puis revenez au souffle. Sans agacement. Sans commentaire."],
        [130, "Chaque retour est une répétition. Comme un muscle qui se renforce."],
        [165, "Peu importe le nombre de distractions. Ce qui compte, c'est le retour."],
        [200, "Continuez. Souffle... distraction... retour. C'est le cycle normal."],
        [240, "Dernières respirations. Remarquez : vous êtes toujours là."],
        [275, "Préparez-vous doucement à rouvrir les yeux."]
      ],
      conclusion: "Si vous vous êtes distrait dix fois, vous avez fait dix retours. C'est dix répétitions de l'exercice."
    },
    {
      id: "p4", num: 4, titre: "Ramener son attention", duree: 5,
      objectif: "S'entraîner activement au retour de l'attention.",
      pedagogie: "Ramener l'attention est le vrai mouvement de la méditation. Vous allez probablement partir dans des pensées, des sons ou des sensations : le progrès consiste à revenir avec simplicité, sans commentaire intérieur. Dans la vie, ce même retour permet de reprendre le fil avant de répondre trop vite, de ruminer ou de s'éparpiller.",
      script: [
        [0, "Asseyez-vous confortablement. Fermez les yeux."],
        [15, "Trois grandes respirations pour arriver ici, maintenant."],
        [45, "Posez l'attention sur le souffle. C'est votre point de départ."],
        [75, "Aujourd'hui, nous nous entraînons au retour. Dès que l'esprit part, ramenez-le, avec douceur."],
        [110, "Imaginez que vous guidez un chiot : fermement, mais gentiment."],
        [145, "Souffle. Si vous partez, revenez. Encore."],
        [185, "Remarquez la qualité du retour : pas de reproche, juste un mouvement simple."],
        [225, "Le souffle est toujours là, qui vous attend."],
        [260, "Dernière minute. Laissez l'attention se déposer sur la respiration, comme une feuille sur l'eau."]
      ],
      conclusion: "Ce geste de retour, vous pourrez le faire n'importe où. C'est lui que vous entraînez à chaque séance."
    },
    {
      id: "p5", num: 5, titre: "Observer son corps", duree: 6,
      objectif: "Découvrir le scan corporel et élargir l'attention au corps.",
      pedagogie: "Le corps donne des informations très concrètes : tension dans la mâchoire, épaules hautes, ventre serré, fatigue dans les yeux. Cette séance vous apprend à écouter ces signaux avant qu'ils ne deviennent trop forts. Si vous ne sentez presque rien, restez simple : contact avec le sol, poids du corps, chaleur ou fraîcheur suffisent.",
      script: [
        [0, "Installez-vous, assis ou allongé. Fermez les yeux."],
        [20, "Trois respirations profondes pour vous déposer."],
        [50, "Portez l'attention au sommet de votre crâne. Que sentez-vous ?"],
        [80, "Descendez vers le visage : le front... les yeux... la mâchoire. Relâchez-la si elle est serrée."],
        [120, "Les épaules. Souvent hautes, souvent tendues. Laissez-les descendre."],
        [160, "Les bras, jusqu'au bout des doigts. Peut-être des picotements, de la chaleur."],
        [200, "La poitrine et le ventre, qui bougent au rythme du souffle."],
        [240, "Le dos, en contact avec le dossier. Les hanches, le poids du corps sur l'assise."],
        [280, "Les jambes... les pieds... le contact avec le sol."],
        [320, "Sentez maintenant le corps entier, présent, respirant."]
      ],
      conclusion: "Votre corps est un raccourci vers le présent. Une tension remarquée est déjà à moitié relâchée."
    },
    {
      id: "p6", num: 6, titre: "Comprendre les émotions", duree: 7,
      objectif: "Observer les émotions comme des sensations dans le corps.",
      pedagogie: "Une émotion se manifeste souvent dans le corps avant de devenir une histoire dans la tête : gorge serrée, poitrine lourde, chaleur, agitation. Vous allez apprendre à la sentir sans la nourrir par le scénario. Si l'émotion devient trop forte, revenez aux pieds, ouvrez les yeux, et choisissez une sensation neutre : la sécurité passe avant la performance.",
      script: [
        [0, "Installez-vous. Fermez les yeux. Quelques respirations profondes."],
        [30, "Posez l'attention sur le souffle, une minute, pour stabiliser l'esprit."],
        [90, "Maintenant, demandez-vous : comment je me sens, là, maintenant ?"],
        [120, "Pas besoin de mot précis. Cherchez plutôt où ça se passe dans le corps."],
        [160, "Une tension ? Une lourdeur ? Une légèreté ? Une zone neutre ?"],
        [200, "Observez cette sensation comme un scientifique curieux. Sa taille, sa forme, son intensité."],
        [250, "Respirez vers cette zone, sans chercher à la changer."],
        [300, "Remarquez : la sensation bouge, fluctue. Rien n'est figé."],
        [350, "Revenez au souffle. L'émotion est là, vous êtes là, et tout va bien."],
        [390, "Dernières respirations, en accueillant ce qui est présent."]
      ],
      conclusion: "Vous venez d'apprendre le geste le plus utile face aux émotions : les sentir dans le corps au lieu de les ruminer dans la tête."
    },
    {
      id: "p7", num: 7, titre: "Accueillir les pensées", duree: 7,
      objectif: "Observer les pensées sans s'y accrocher ni les chasser.",
      pedagogie: "Les pensées vont apparaître toutes seules : listes de choses à faire, souvenirs, jugements, anticipations. La pratique consiste à les reconnaître comme des événements mentaux, pas comme des ordres à suivre. Vous n'avez pas besoin de les chasser : vous pouvez simplement voir 'une pensée est là' et revenir au souffle.",
      script: [
        [0, "Asseyez-vous, fermez les yeux, posez-vous avec trois grandes respirations."],
        [30, "Stabilisez l'attention sur le souffle pendant un moment."],
        [90, "Imaginez maintenant que vos pensées sont des nuages dans un grand ciel."],
        [130, "Vous êtes le ciel. Les pensées passent, le ciel reste."],
        [180, "Quand une pensée arrive, regardez-la apparaître... et disparaître."],
        [230, "Certaines reviennent avec insistance. Ce n'est pas grave. Elles repasseront."],
        [280, "Si vous êtes monté dans une pensée sans vous en rendre compte, descendez simplement. Revenez au ciel."],
        [330, "Le souffle est toujours là, en arrière-plan, comme un fil."],
        [380, "Encore un moment. Le ciel, les nuages, le souffle."]
      ],
      conclusion: "Vous n'êtes pas vos pensées. Vous êtes celui ou celle qui les regarde passer."
    },
    {
      id: "p8", num: 8, titre: "Développer sa concentration", duree: 8,
      objectif: "Affiner et prolonger l'attention sur un objet unique.",
      pedagogie: "La concentration se construit par petites séries, comme une endurance douce. Compter les respirations donne à l'esprit une tâche simple : si vous perdez le compte, vous venez de voir que l'attention est partie. Reprendre à un n'est pas recommencer à zéro, c'est renforcer la capacité à revenir.",
      script: [
        [0, "Installez-vous, dos droit, et fermez les yeux."],
        [20, "Trois respirations amples. Puis laissez le souffle naturel revenir."],
        [60, "Nous allons compter les respirations. Inspirez... expirez... un."],
        [95, "Inspirez... expirez... deux. Continuez ainsi jusqu'à dix."],
        [140, "Arrivé à dix, recommencez à un. Si vous perdez le compte, reprenez à un, sans drame."],
        [200, "Perdre le compte n'est pas un échec : c'est l'information que l'esprit est parti. Précieux."],
        [270, "Continuez à votre rythme. Le compte, le souffle, rien d'autre."],
        [340, "Si c'est facile, affinez : sentez le tout début de l'inspiration, la toute fin de l'expiration."],
        [410, "Dernière série. Laissez l'attention devenir fine, précise, posée."],
        [460, "Lâchez le compte. Juste le souffle, quelques instants."]
      ],
      conclusion: "La concentration n'est pas un don : c'est un entraînement. Chaque compte est une répétition."
    },
    {
      id: "p9", num: 9, titre: "Cultiver le calme", duree: 8,
      objectif: "Allonger l'expiration pour activer la détente physiologique.",
      pedagogie: "Quand l'expiration devient plus longue que l'inspiration, le corps reçoit souvent un signal d'apaisement. Vous n'avez pas à vous forcer au calme : vous allez créer les conditions pour qu'il arrive. Cette technique est utile les yeux ouverts, avant un message difficile, une réunion ou un moment de tension.",
      script: [
        [0, "Installez-vous confortablement. Relâchez les épaules, la mâchoire."],
        [25, "Observez d'abord votre respiration naturelle, sans rien changer."],
        [70, "Maintenant, allongez doucement vos expirations. Inspirez sur quatre temps..."],
        [100, "...expirez sur six temps. Comme si vous souffliez sur une bougie sans l'éteindre."],
        [150, "Inspirez... deux... trois... quatre. Expirez... deux... trois... quatre... cinq... six."],
        [220, "Sentez le corps se relâcher un peu plus à chaque expiration."],
        [290, "Si compter devient lourd, gardez simplement l'idée : expirer long, expirer doux."],
        [360, "Le calme s'installe par couches. Laissez-le faire."],
        [420, "Revenez à une respiration naturelle. Savourez l'état présent."]
      ],
      conclusion: "Vous connaissez maintenant le bouton physiologique du calme : l'expiration longue. Il marche partout, même les yeux ouverts."
    },
    {
      id: "p10", num: 10, titre: "La pleine conscience au quotidien", duree: 9,
      objectif: "Étendre l'attention aux sons, au corps et à l'instant ordinaire.",
      pedagogie: "La méditation ne sert pas à devenir bon pendant une séance, mais à être plus présent dans la vraie vie. Aujourd'hui, vous élargissez l'attention : sons, corps, souffle, pensées peuvent être là ensemble. C'est le pont vers les gestes ordinaires : marcher, manger, écouter quelqu'un, attendre sans sortir automatiquement le téléphone.",
      script: [
        [0, "Asseyez-vous. Fermez les yeux. Trois grandes respirations."],
        [30, "Stabilisez-vous une minute sur le souffle."],
        [90, "Élargissez maintenant l'attention aux sons autour de vous."],
        [130, "Les sons proches... les sons lointains... le silence entre les sons."],
        [190, "Pas besoin d'identifier ni de juger. Écoutez comme on écoute la pluie."],
        [250, "Élargissez encore : les sons, le corps, le souffle. Tout en même temps."],
        [320, "Vous êtes en attention ouverte. Tout peut apparaître, rien ne vous accroche."],
        [390, "C'est exactement cette qualité de présence que vous pouvez emmener dans votre journée."],
        [450, "Marcher, manger, écouter quelqu'un : tout peut devenir méditation."],
        [500, "Revenez au souffle. Quelques respirations avant de terminer."]
      ],
      conclusion: "Essayez aujourd'hui : une activité ordinaire — boire un café, marcher — en pleine attention. C'est la séance bonus."
    },
    {
      id: "p11", num: 11, titre: "Réagir au stress", duree: 10,
      objectif: "Apprendre la pause STOP pour répondre au lieu de réagir.",
      pedagogie: "Le stress pousse à réagir vite : répondre, fuir, contrôler, s'agacer. La méthode STOP crée une pause praticable en vraie vie : s'arrêter, respirer, observer ce qui se passe, puis choisir la suite. On commence avec une situation légère pour entraîner l'outil sans se mettre en difficulté.",
      script: [
        [0, "Installez-vous. Fermez les yeux. Posez-vous avec quelques respirations."],
        [40, "Stabilisez l'attention sur le souffle, deux minutes."],
        [160, "Pensez maintenant à une situation légèrement stressante. Légèrement — pas la pire."],
        [210, "Remarquez ce qui se passe dans le corps quand vous y pensez. Gorge, poitrine, ventre ?"],
        [270, "Première étape : S. Stoppez. Vous venez de le faire en remarquant."],
        [320, "Deuxième étape : T. Take a breath. Une grande respiration consciente."],
        [370, "Troisième étape : O. Observez. Les sensations, les pensées, sans vous identifier."],
        [430, "Quatrième étape : P. Poursuivez, mais en choisissant votre réponse."],
        [490, "Refaites le cycle une fois : Stop... Respiration... Observation... Poursuite."],
        [550, "Lâchez la situation. Revenez au souffle, au calme du moment présent."]
      ],
      conclusion: "STOP tient en quinze secondes dans la vraie vie. C'est votre nouvel outil d'urgence."
    },
    {
      id: "p12", num: 12, titre: "Développer la bienveillance", duree: 10,
      objectif: "Découvrir la méditation de bienveillance (metta).",
      pedagogie: "La bienveillance n'est pas se convaincre que tout va bien. C'est apprendre à se parler sans se durcir, surtout quand on est fatigué, stressé ou déçu. Si les phrases semblent artificielles, ce n'est pas un problème : dites-les doucement, comme une direction, pas comme une obligation d'y croire tout de suite.",
      script: [
        [0, "Installez-vous confortablement. Fermez les yeux. Respirez tranquillement."],
        [40, "Posez une main sur votre cœur, si vous le souhaitez."],
        [80, "Répétez intérieurement, pour vous-même : « Que je sois en paix. »"],
        [130, "« Que je sois en bonne santé. Que je vive avec aisance. »"],
        [190, "Si ça résiste, c'est normal. La bienveillance envers soi est souvent la plus difficile."],
        [250, "Pensez maintenant à une personne que vous aimez. Visualisez son visage."],
        [300, "« Que tu sois en paix. Que tu sois en bonne santé. Que tu vives avec aisance. »"],
        [370, "Élargissez à une personne neutre — un voisin, un commerçant."],
        [430, "Mêmes souhaits, sincèrement, simplement."],
        [490, "Élargissez enfin à tous : « Que chacun soit en paix. »"],
        [550, "Revenez à vous. Une main sur le cœur. Une dernière respiration douce."]
      ],
      conclusion: "La bienveillance n'est pas de la naïveté : c'est un entraînement qui change la météo intérieure."
    },
    {
      id: "p13", num: 13, titre: "Méditer de façon autonome", duree: 12,
      objectif: "Pratiquer avec un guidage minimal, en autonomie.",
      pedagogie: "Vous avez maintenant plusieurs options : souffle, corps, sons, pensées, attention ouverte. Cette séance vous apprend à choisir votre point d'appui et à pratiquer avec moins de guidage. Si vous vous sentez perdu, revenez à la règle la plus simple : sentir une respiration, puis la suivante.",
      script: [
        [0, "Installez-vous. Vous connaissez la posture : digne et détendue."],
        [30, "Choisissez votre ancre : le souffle, le corps, ou les sons."],
        [70, "Je vais maintenant vous laisser pratiquer. Quelques rappels viendront, espacés."],
        [180, "Si l'esprit est parti, revenez. Sans jugement."],
        [330, "Vous pouvez élargir ou resserrer l'attention, comme un objectif photo."],
        [480, "Le silence n'est pas vide : il est plein de votre pratique."],
        [600, "Encore quelques minutes. Vous êtes votre propre guide."],
        [690, "Préparez-vous doucement à terminer. Une dernière respiration profonde."]
      ],
      conclusion: "Vous venez de méditer presque seul. C'était l'objectif depuis le premier jour."
    },
    {
      id: "p14", num: 14, titre: "Construire une pratique durable", duree: 12,
      objectif: "Consolider l'habitude et définir sa pratique pour la suite.",
      pedagogie: "Une pratique durable doit être facile à retrouver. Elle repose sur un déclencheur clair, une durée honnête et une grande souplesse : mieux vaut 5 minutes régulières que 20 minutes idéales mais abandonnées. Aujourd'hui, vous choisissez comment faire entrer la méditation dans une vraie journée, pas dans une journée parfaite.",
      script: [
        [0, "Installez-vous pour cette dernière séance du parcours. Fermez les yeux."],
        [30, "Commencez par ce que vous préférez : souffle, corps ou sons. Deux minutes."],
        [150, "Pendant que vous pratiquez, laissez venir cette question : quel moment de ma journée est le mien ?"],
        [240, "Pas de réponse forcée. Laissez l'idée flotter, revenez au souffle."],
        [350, "Deuxième question : quelle durée est honnête pour moi ? Pas idéale. Honnête."],
        [450, "Revenez à la pratique pure. Souffle. Corps. Présence."],
        [560, "Rappelez-vous : les jours sans séance ne détruisent rien. La pratique vous attend, toujours."],
        [650, "Dernières respirations de ce parcours. Mesurez le chemin depuis la séance 1."]
      ],
      conclusion: "Le parcours se termine, votre pratique commence. L'application continuera de vous proposer chaque jour une séance adaptée."
    }
  ],

  /* ---------- PARCOURS 2 : LA PLEINE CONSCIENCE AU QUOTIDIEN ---------- */
  /* Débloqué après la séance 14. 7 étapes courtes ancrées dans la vie ordinaire. */
  parcours2: [
    {
      id: "q1", num: 1, titre: "Le café du matin", duree: 2,
      objectif: "Transformer un geste ordinaire en moment de pleine présence.",
      pedagogie: "La méditation ne s'arrête pas sur le coussin. Ce matin, boire votre café ou votre thé devient votre pratique : pas d'écran, pas d'anticipation de la journée — juste la tasse, la chaleur, l'arôme.",
      script: [
        [0,   "Tenez votre tasse à deux mains. Sentez la chaleur dans vos paumes."],
        [18,  "Portez la tasse à votre nez. Respirez l'arôme sans chercher à le nommer."],
        [40,  "Prenez une première gorgée, lentement. Sentez la chaleur descendre."],
        [65,  "Regardez autour de vous : la lumière du matin, les sons, l'espace."],
        [90,  "Une deuxième gorgée, encore plus lente. Goût, chaleur, texture."],
        [110, "Vous n'avez rien à faire avant de reposer cette tasse."]
      ],
      conclusion: "Ce matin existe une seule fois. Vous venez de le goûter vraiment."
    },
    {
      id: "q2", num: 2, titre: "L'attente", duree: 3,
      objectif: "Transformer un moment d'attente en ancre de présence.",
      pedagogie: "Attendre le bus, la machine à café, un ascenseur : on sort instinctivement le téléphone. Aujourd'hui, essayez le contraire — rester là, sans occupation, juste présent.",
      script: [
        [0,   "Vous attendez quelque chose. Posez le téléphone si vous l'aviez en main."],
        [18,  "Sentez vos pieds dans vos chaussures. Le sol sous vous."],
        [42,  "Regardez autour de vous comme si c'était la première fois dans cet endroit."],
        [72,  "Écoutez un son — n'importe lequel. Suivez-le jusqu'à ce qu'il s'arrête."],
        [108, "Votre respiration : naturelle, discrète. Suivez-la deux ou trois fois."],
        [150, "L'attente touche à sa fin. Vous l'avez traversée sans la fuir."]
      ],
      conclusion: "Chaque attente est une invitation. La prochaine fois, vous saurez."
    },
    {
      id: "q3", num: 3, titre: "La marche", duree: 3,
      objectif: "Découvrir la marche consciente.",
      pedagogie: "Thich Nhat Hanh disait : « Marchez comme si vos pieds embrassaient la terre. » Chaque pas peut être un retour au présent — pas besoin de forêt : un couloir, une rue, quelques mètres suffisent.",
      script: [
        [0,   "Choisissez un trajet court : un couloir, un trottoir, quelques mètres."],
        [18,  "Commencez à marcher un peu plus lentement que d'habitude."],
        [42,  "Sentez le talon qui touche le sol en premier, puis la voûte plantaire, puis les orteils."],
        [72,  "Votre poids se déplace d'un pied à l'autre. Remarquez ce balancement doux."],
        [108, "Levez les yeux. Regardez là où vous allez, sans anticiper."],
        [140, "Chaque pas : vous arrivez. Pas « vous allez ». Vous êtes déjà là."]
      ],
      conclusion: "Il n'y a nulle part où aller. Là où vous posez le pied, c'est chez vous."
    },
    {
      id: "q4", num: 4, titre: "Les repas", duree: 3,
      objectif: "Ralentir le début d'un repas pour y être vraiment présent.",
      pedagogie: "Manger en pleine conscience ne signifie pas manger en silence pendant une heure. Ça commence par une bouchée — la première. Le reste du repas peut être normal.",
      script: [
        [0,   "Vous êtes devant votre repas. Avant de commencer, regardez-le."],
        [20,  "Les couleurs, les formes, l'arôme qui monte."],
        [45,  "Prenez une première bouchée. Posez vos couverts."],
        [68,  "Mâchez lentement. Quel goût ? Quelle texture ? Quelle chaleur ou fraîcheur ?"],
        [98,  "Avalez. Sentez le trajet."],
        [120, "Un souffle avant la bouchée suivante. Vous avez déjà fait quelque chose de précieux."]
      ],
      conclusion: "La nourriture goûte mieux quand on lui prête attention. Et ça commence toujours par la première bouchée."
    },
    {
      id: "q5", num: 5, titre: "Les transitions", duree: 2,
      objectif: "Créer une micro-pause consciente à chaque changement d'activité.",
      pedagogie: "Entre deux tâches, on passe souvent directement sans reprendre son souffle. Une pause de vingt secondes à chaque transition restaure l'attention et réduit le sentiment de dispersion.",
      script: [
        [0,   "Vous venez de finir quelque chose. Arrêtez-vous avant de passer à la suite."],
        [18,  "Posez les mains sur vos cuisses ou les bras de votre fauteuil."],
        [35,  "Trois respirations. Inspirez… expirez. Inspirez… expirez. Inspirez… expirez."],
        [65,  "Ce qui vient d'être fait est terminé. Ça compte, même si ça semble petit."],
        [88,  "Quelle est la prochaine chose ? Une seule. La prochaine."],
        [108, "Un dernier souffle. Puis bougez, avec clarté."]
      ],
      conclusion: "Entre chaque acte, il y a un espace. Vous venez d'y habiter quelques secondes."
    },
    {
      id: "q6", num: 6, titre: "Le soir", duree: 4,
      objectif: "Clore la journée avec douceur, sans rumination.",
      pedagogie: "Revenir sur sa journée avant de dormir n'est utile que si on ne le fait pas comme un procureur. L'idée : remarquer, pas juger — comme regarder passer un train, pas comme y monter.",
      script: [
        [0,   "Allongé ou assis confortablement. Fermez les yeux."],
        [22,  "Trois grandes respirations pour marquer la fin de la journée."],
        [58,  "Laissez la journée défiler, du matin jusqu'à maintenant."],
        [105, "Ne cherchez pas à analyser. Juste observer ce qui vient."],
        [150, "Un moment difficile ? Notez-le simplement. Pas de jugement."],
        [195, "Un moment agréable, même minuscule ? Restez-y une seconde."],
        [228, "La journée a existé. Elle est terminée. Expirez, et laissez-la partir."]
      ],
      conclusion: "La nuit ne demande pas de compte-rendu. Elle demande juste que vous la laissiez venir."
    },
    {
      id: "q7", num: 7, titre: "Sans guide", duree: 5,
      objectif: "Méditer librement, sans guide, sans objectif.",
      pedagogie: "Voici la séance la plus simple et la plus difficile : cinq minutes sans guide. Pas d'instruction, pas d'objectif, juste vous. C'est exactement ce à quoi tout ce parcours préparait.",
      script: [
        [0,   "Installez-vous. Fermez les yeux."],
        [30,  "À partir de maintenant, vous êtes votre propre guide."],
        [120, ""],
        [240, ""],
        [285, "Quelques instants encore."]
      ],
      conclusion: "Vous savez méditer. La pratique, désormais, est entièrement vôtre."
    }
  ],

  /* ---------- SESSIONS EXPRESS (urgence émotionnelle) ---------- */
  express: [
    {
      id: "x1", titre: "Crise de stress", duree: 1, icone: "🌊",
      pedagogie: "Une expiration deux fois plus longue que l'inspiration freine immédiatement la réponse de stress.",
      script: [
        [0, "Où que vous soyez, posez les deux pieds au sol."],
        [8, "Inspirez par le nez sur 3 temps."],
        [14, "Expirez lentement par la bouche sur 6 temps, comme dans une paille."],
        [24, "Encore. Inspirez... 2... 3. Expirez... 2... 3... 4... 5... 6."],
        [38, "Une dernière fois, la plus lente possible."],
        [50, "Relâchez les épaules. Vous avez repris la main."]
      ],
      conclusion: "Le pic est passé. Refaites ce cycle autant de fois que nécessaire."
    },
    {
      id: "x2", titre: "Retrouver son calme", duree: 2, icone: "🍃",
      pedagogie: "Ancrer les sens dans le présent interrompt la spirale mentale.",
      script: [
        [0, "Asseyez-vous ou restez debout, stable. Respirez profondément une fois."],
        [12, "Nommez intérieurement 3 choses que vous voyez autour de vous."],
        [30, "Maintenant 2 choses que vous entendez."],
        [50, "Et 1 chose que vous sentez physiquement : le sol, la chaise, vos mains."],
        [70, "Revenez au souffle. Inspirez le calme..."],
        [85, "...expirez la tension. Encore deux fois."],
        [105, "Vous êtes ici. Maintenant. C'est tout ce qui compte."]
      ],
      conclusion: "Le mental s'est posé. Reprenez votre journée à votre rythme."
    },
    {
      id: "x3", titre: "Avant une réunion", duree: 2, icone: "💼",
      pedagogie: "Deux minutes de centrage améliorent la clarté et la qualité de présence en réunion.",
      script: [
        [0, "Asseyez-vous droit. Posez les mains à plat sur le bureau ou les cuisses."],
        [12, "Trois respirations profondes, expirations longues."],
        [40, "Demandez-vous : quelle est mon intention pour cette réunion ?"],
        [60, "Une intention simple : écouter, être clair, rester calme."],
        [80, "Revenez au souffle. Sentez votre stabilité, votre assise."],
        [100, "Vous entrez dans cette réunion centré, pas précipité."]
      ],
      conclusion: "Intention posée, corps stable. Allez-y."
    },
    {
      id: "x4", titre: "Avant un entretien", duree: 3, icone: "🎯",
      pedagogie: "Le trac est de l'énergie. Bien respiré, il devient de la présence plutôt que de la panique.",
      script: [
        [0, "Trouvez un endroit calme, même quelques mètres carrés suffisent."],
        [12, "Sentez vos pieds bien ancrés dans le sol. Votre colonne qui s'allonge."],
        [35, "Respirez en carré : inspirez 4 temps... retenez 4 temps..."],
        [55, "...expirez 4 temps... restez poumons vides 4 temps."],
        [80, "Encore un carré complet, à votre rythme."],
        [110, "Le trac que vous sentez, c'est de l'énergie disponible. Elle est de votre côté."],
        [135, "Rappelez-vous : vous connaissez votre sujet. Vous êtes légitime."],
        [160, "Une dernière grande respiration. Épaules basses, regard ouvert."]
      ],
      conclusion: "Vous êtes prêt. L'énergie est là, canalisée."
    },
    {
      id: "x5", titre: "Difficulté à dormir", duree: 5, icone: "🌙",
      pedagogie: "Le cerveau ne s'endort pas sur commande, mais il suit le corps : ralentir le souffle et détendre les muscles ouvre la porte du sommeil.",
      script: [
        [0, "Allongé dans votre lit, laissez le corps s'enfoncer dans le matelas."],
        [25, "Respirez en 4-7-8 : inspirez par le nez sur 4 temps..."],
        [40, "...retenez sur 7 temps... expirez très lentement sur 8 temps."],
        [65, "Encore un cycle. Inspirez... retenez... soufflez longuement."],
        [100, "Laissez maintenant la respiration naturelle revenir, lente et basse."],
        [140, "Relâchez le front... les yeux... la mâchoire."],
        [180, "Les épaules s'enfoncent. Les bras sont lourds. Très lourds."],
        [220, "Le ventre se détend. Les jambes sont lourdes. Les pieds, détendus."],
        [260, "Chaque expiration vous enfonce un peu plus dans le matelas."],
        [290, "Plus rien à faire. Plus rien à réussir. Laissez venir."]
      ],
      conclusion: "Restez allongé, laissez le souffle vous bercer. Bonne nuit."
    },
    {
      id: "x6", titre: "Après une mauvaise nouvelle", duree: 3, icone: "🤍",
      pedagogie: "Face au choc, le premier soin n'est pas de penser mais de revenir dans le corps, en sécurité dans l'instant.",
      script: [
        [0, "Asseyez-vous. Posez une main sur votre poitrine, une sur votre ventre."],
        [15, "Respirez doucement. Pas besoin de respirer grand, juste régulier."],
        [40, "Ce que vous ressentez a le droit d'être là. Ne luttez pas contre."],
        [70, "Sentez la chaleur de vos mains. Vous êtes là, avec vous-même."],
        [100, "À chaque expiration, dites intérieurement : « Là, maintenant, je suis en sécurité. »"],
        [135, "Les pensées vont tourner. Laissez-les. Revenez aux mains, au souffle."],
        [160, "Vous n'avez rien à résoudre dans les trois prochaines minutes. Juste respirer."]
      ],
      conclusion: "Prenez soin de vous aujourd'hui. Une chose à la fois."
    },
    {
      id: "x7", titre: "Pause mentale", duree: 2, icone: "☁️",
      pedagogie: "Une vraie pause n'est pas un changement d'écran : c'est un moment sans tâche, qui restaure l'attention.",
      script: [
        [0, "Éloignez-vous de vos écrans un instant. Fermez les yeux si possible."],
        [12, "Une grande inspiration... et un long soupir. Oui, un vrai soupir."],
        [28, "Encore un. Le soupir est la pause naturelle du système nerveux."],
        [45, "Laissez maintenant le souffle libre. Ne faites rien. Vraiment rien."],
        [70, "S'ennuyer dix secondes, c'est recharger l'attention."],
        [95, "Une dernière respiration ample avant de reprendre."]
      ],
      conclusion: "Pause terminée. Votre attention vous dit merci."
    }
  ],

  /* ---------- BIBLIOTHÈQUE ÉMOTIONNELLE ---------- */
  emotions: [
    {
      id: "stress", titre: "Stress", icone: "🌊",
      meditation: {
        id: "e-stress", titre: "Déposer la pression", duree: 6,
        pedagogie: "Le stress vit dans le corps avant de vivre dans la tête. On le traite donc par le corps : souffle long, muscles relâchés, appuis sentis.",
        script: [
          [0, "Installez-vous. Sentez vos appuis : pieds, assise, dos."],
          [25, "Trois grandes expirations par la bouche, comme pour déposer un poids."],
          [60, "Passez en revue les zones de tension classiques : mâchoire... épaules... ventre."],
          [110, "À chaque expiration, choisissez une zone et relâchez-la un peu plus."],
          [170, "Le stress est une énergie de mobilisation. Vous n'en avez pas besoin là, maintenant."],
          [230, "Respirez en 4-6 : inspirez sur 4, expirez sur 6."],
          [290, "Continuez. Le corps comprend ce langage."],
          [340, "Revenez à une respiration libre. Mesurez la différence."]
        ],
        conclusion: "La pression déposée ne disparaît pas toujours, mais elle pèse moins. C'est déjà beaucoup."
      },
      liens: ["x1", "x2", "coherence"]
    },
    {
      id: "anxiete", titre: "Anxiété", icone: "🌀",
      meditation: {
        id: "e-anxiete", titre: "Revenir dans l'instant", duree: 6,
        pedagogie: "L'anxiété est une projection : elle vit dans le futur. Les sens, eux, ne connaissent que le présent. S'y ancrer coupe le carburant de l'anxiété.",
        script: [
          [0, "Asseyez-vous, pieds bien à plat. Ouvrez ou fermez les yeux, comme vous préférez."],
          [25, "L'anxiété parle du futur. Nous allons revenir au présent, par les sens."],
          [60, "Le toucher d'abord : sentez le contact de vos vêtements, du siège, du sol."],
          [110, "L'ouïe : les sons proches, les sons lointains. Sans les juger."],
          [170, "Le souffle : frais à l'inspiration, tiède à l'expiration."],
          [230, "Si une inquiétude revient, notez « futur », et revenez aux sens."],
          [290, "Ici, maintenant, dans cette pièce, à cette seconde : que se passe-t-il réellement ?"],
          [330, "Le plus souvent : rien de menaçant. Juste vous, qui respirez."]
        ],
        conclusion: "L'anxiété reviendra peut-être. Vous savez maintenant où est la sortie : les sens, le présent."
      },
      liens: ["x2", "carree", "x6"]
    },
    {
      id: "fatigue", titre: "Fatigue", icone: "🔋",
      meditation: {
        id: "e-fatigue", titre: "Recharger en douceur", duree: 5,
        pedagogie: "Méditer fatigué ne demande pas d'effort de concentration intense : on privilégie une attention douce et une respiration légèrement dynamisante.",
        script: [
          [0, "Asseyez-vous, dos droit pour rester éveillé. Yeux mi-clos si besoin."],
          [25, "Trois respirations un peu plus amples que d'habitude."],
          [60, "Adoptez un rythme tonique : inspirez sur 3 temps, expirez sur 3 temps."],
          [120, "Sentez l'air qui circule, la cage thoracique qui s'ouvre."],
          [180, "Étirez doucement la nuque, les épaules, tout en respirant."],
          [230, "Revenez au rythme 3-3. L'oxygène circule, le corps se réveille."],
          [280, "Terminez par une grande inspiration... et une expiration sonore."]
        ],
        conclusion: "La fatigue mérite parfois du repos plutôt qu'une séance. Écoutez ce que votre corps demande vraiment."
      },
      liens: ["energie", "x7"]
    },
    {
      id: "colere", titre: "Colère", icone: "🔥",
      meditation: {
        id: "e-colere", titre: "Laisser retomber le feu", duree: 6,
        pedagogie: "La colère a une durée de vie physiologique courte — quelques dizaines de secondes — si on ne la réalimente pas en pensées. Respirer sans ruminer la laisse retomber naturellement.",
        script: [
          [0, "Debout ou assis, sentez vos appuis. La colère a besoin d'un sol stable."],
          [25, "Expirez fort par la bouche, deux fois. Laissez sortir la vapeur."],
          [60, "Maintenant, respirez lentement. La colère est une vague : elle monte, elle redescend."],
          [120, "Sentez où elle vit dans le corps : poitrine, gorge, mâchoires, poings ?"],
          [180, "Observez la sensation sans rejouer la scène. C'est la clé : sensation, pas scénario."],
          [240, "Si la scène revient, notez « histoire », et revenez à la sensation brute."],
          [300, "La vague redescend déjà. Respirez avec elle."]
        ],
        conclusion: "La colère contient souvent un message légitime. Vous pourrez l'écouter à froid — c'est là qu'il devient utile."
      },
      liens: ["x1", "apaisement"]
    },
    {
      id: "tristesse", titre: "Tristesse", icone: "🌧️",
      meditation: {
        id: "e-tristesse", titre: "Faire de la place", duree: 6,
        pedagogie: "La tristesse n'est pas un problème à résoudre mais une émotion à traverser. L'accueillir avec douceur raccourcit son passage ; la fuir le prolonge.",
        script: [
          [0, "Installez-vous dans une position qui vous réconforte."],
          [25, "Posez une main sur le cœur. Respirez doucement."],
          [70, "La tristesse est là. Vous n'avez pas à la chasser, ni à la justifier."],
          [120, "Respirez vers elle, comme on entrouvre une fenêtre dans une pièce fermée."],
          [180, "Dites intérieurement : « C'est difficile en ce moment, et c'est humain. »"],
          [240, "Si des larmes viennent, elles ont leur place. Elles font partie du passage."],
          [300, "Restez avec vous-même, comme vous resteriez avec un ami qui traverse cela."]
        ],
        conclusion: "Vous venez de vous offrir ce qui aide le plus : de la présence sans jugement."
      },
      liens: ["x6", "apaisement"]
    },
    {
      id: "agitation", titre: "Agitation", icone: "🌪️",
      meditation: {
        id: "e-agitation", titre: "Poser le mental", duree: 5,
        pedagogie: "Quand l'esprit tourne vite, lui donner une tâche simple et répétitive — compter, suivre le souffle — est plus efficace que lui demander le silence.",
        script: [
          [0, "Asseyez-vous. L'agitation est là ? Parfait, on fait avec."],
          [20, "Donnons au mental un os à ronger : comptez vos expirations jusqu'à 5, puis recommencez."],
          [60, "Un... deux... trois... quatre... cinq. Et on reprend à un."],
          [130, "Si le compte se perd dans une pensée, aucune importance. Reprenez à un."],
          [200, "Remarquez : le rythme ralentit déjà, tout seul."],
          [250, "Encore quelques cycles, de plus en plus posés."]
        ],
        conclusion: "Un esprit agité n'est pas un mauvais esprit. C'est un esprit vivant qui apprend à se poser."
      },
      liens: ["carree", "x7"]
    },
    {
      id: "concentration", titre: "Concentration", icone: "🎯",
      meditation: {
        id: "e-concentration", titre: "Affûter l'attention", duree: 5,
        pedagogie: "Avant un travail exigeant, quelques minutes d'attention focalisée agissent comme un échauffement : elles réduisent le temps de mise en route et les digressions.",
        script: [
          [0, "Asseyez-vous droit. Cette séance est un échauffement de l'attention."],
          [20, "Fixez l'attention sur le point précis où l'air entre dans les narines."],
          [70, "Rien d'autre. Juste ce point, fin comme une pointe de crayon."],
          [130, "Chaque distraction ramenée affûte un peu plus l'attention."],
          [200, "Maintenant, définissez votre prochaine tâche en une phrase claire."],
          [240, "Visualisez-vous en train de la commencer, calmement, sans détour."],
          [275, "Une dernière respiration. L'attention est prête."]
        ],
        conclusion: "Allez directement à votre tâche, sans détour par les notifications. L'élan est là."
      },
      liens: ["x3", "energie"]
    },
    {
      id: "sommeil", titre: "Sommeil", icone: "🌙",
      meditation: {
        id: "e-sommeil", titre: "Préparer la nuit", duree: 8,
        pedagogie: "Le sommeil vient quand le système nerveux passe en mode repos. On l'y aide : lumière basse, souffle 4-7-8, détente musculaire progressive.",
        script: [
          [0, "Allongez-vous. Lumière éteinte ou tamisée. L'écran posé loin après cette séance."],
          [30, "Trois cycles de 4-7-8 : inspirez sur 4... retenez sur 7... expirez sur 8."],
          [90, "Encore... inspirez... retenez... soufflez très lentement."],
          [150, "Laissez maintenant la respiration libre, basse, tranquille."],
          [210, "Détendez le visage : front lisse, yeux lourds, mâchoire relâchée."],
          [270, "Les épaules fondent dans le matelas. Les bras sont lourds."],
          [330, "Le dos se dépose. Le ventre est souple. Les jambes, immobiles et lourdes."],
          [400, "Chaque expiration descend d'un étage vers le sommeil."],
          [450, "Plus rien à penser. La nuit s'occupe du reste."]
        ],
        conclusion: "Restez allongé, gardez les yeux fermés. Le sommeil n'aime pas être attendu : laissez-le venir."
      },
      liens: ["x5", "sommeil478"]
    },
    {
      id: "motivation", titre: "Motivation", icone: "⚡",
      meditation: {
        id: "e-motivation", titre: "Retrouver l'élan", duree: 5,
        pedagogie: "La motivation suit l'action plus souvent qu'elle ne la précède. Cette séance combine respiration dynamisante et visualisation du premier pas — le seul qui compte.",
        script: [
          [0, "Asseyez-vous droit, comme quelqu'un qui s'apprête à se lever."],
          [20, "Respiration tonique : inspirez sur 3, expirez sur 3, dix cycles."],
          [90, "Sentez l'énergie circuler. Le corps se met en route avant la tête."],
          [150, "Pensez à la tâche qui vous attend. Quelle est la toute première action, la plus petite ?"],
          [210, "Visualisez uniquement celle-là. Pas le projet entier : le premier geste."],
          [250, "Une grande inspiration... et à l'expiration, décidez : je commence par ça."]
        ],
        conclusion: "Ne cherchez pas la motivation pour tout : juste pour les deux prochaines minutes. Le reste suivra."
      },
      liens: ["energie", "x3"]
    }
  ],

  /* ---------- PROTOCOLES DE RESPIRATION ---------- */
  respiration: [
    {
      id: "coherence", titre: "Cohérence cardiaque", icone: "💗",
      phases: [["Inspirez", 5], ["Expirez", 5]],
      duree: 5,
      pedagogie: "Respirer 6 fois par minute synchronise le cœur et la respiration. Pratiquée 5 minutes, la cohérence cardiaque réduit le cortisol pendant plusieurs heures.",
      benefices: "Stress, tension, équilibre émotionnel. Idéal matin, midi et fin de journée.",
      reco: "5 minutes, 3 fois par jour si possible."
    },
    {
      id: "carree", titre: "Respiration carrée", icone: "⬜",
      phases: [["Inspirez", 4], ["Retenez", 4], ["Expirez", 4], ["Poumons vides", 4]],
      duree: 3,
      pedagogie: "Quatre temps égaux, comme les côtés d'un carré. Utilisée par les militaires et les sportifs pour retrouver le contrôle sous pression.",
      benefices: "Concentration, sang-froid, retour au calme rapide.",
      reco: "2 à 3 minutes avant un moment exigeant."
    },
    {
      id: "apaisement", titre: "Apaisement 4-6", icone: "🍃",
      phases: [["Inspirez", 4], ["Expirez", 6]],
      duree: 4,
      pedagogie: "L'expiration plus longue que l'inspiration active le système nerveux parasympathique — celui du repos et de la récupération.",
      benefices: "Anxiété, agitation, tension physique.",
      reco: "3 à 5 minutes dès que la tension monte."
    },
    {
      id: "sommeil478", titre: "Sommeil 4-7-8", icone: "🌙",
      phases: [["Inspirez", 4], ["Retenez", 7], ["Expirez", 8]],
      duree: 3,
      pedagogie: "Popularisée par le Dr Andrew Weil, cette respiration ralentit fortement le rythme cardiaque. La longue rétention puis l'expiration très lente préparent le corps au sommeil.",
      benefices: "Endormissement, réveils nocturnes, décompression du soir.",
      reco: "4 cycles au coucher. À pratiquer allongé."
    },
    {
      id: "energie", titre: "Énergie 3-3", icone: "⚡",
      phases: [["Inspirez", 3], ["Expirez", 3]],
      duree: 2,
      pedagogie: "Un rythme légèrement plus rapide que la respiration de repos oxygène et dynamise sans stresser. L'alternative saine au troisième café.",
      benefices: "Coup de fatigue, début de journée, avant le sport.",
      reco: "2 minutes, assis, dos droit."
    }
  ],

  /* ---------- BADGES ---------- */
  badges: [
    { id: "b1", titre: "Première séance", icone: "🌱", test: s => s.sessions >= 1 },
    { id: "b2", titre: "3 séances", icone: "🌿", test: s => s.sessions >= 3 },
    { id: "b3", titre: "7 séances", icone: "🌳", test: s => s.sessions >= 7 },
    { id: "b4", titre: "30 minutes", icone: "⏳", test: s => s.minutes >= 30 },
    { id: "b5", titre: "1 heure", icone: "🕰️", test: s => s.minutes >= 60 },
    { id: "b6", titre: "Première semaine", icone: "📅", test: s => s.joursDistincts >= 5 }
  ],

  /* ---------- HUMEURS & RECOMMANDATIONS ---------- */
  humeurs: [
    { id: "bien",     icone: "🙂", label: "Bien" },
    { id: "fatigue",  icone: "😐", label: "Fatigué" },
    { id: "stresse",  icone: "😟", label: "Stressé" },
    { id: "deborde",  icone: "😵", label: "Débordé" },
    { id: "sommeil",  icone: "😴", label: "Besoin de dormir" },
    { id: "agace",    icone: "😤", label: "Agacé" },
    { id: "triste",   icone: "😔", label: "Triste" }
  ],

  recoHumeur: {
    bien:    { msg: "Belle énergie ! C'est le moment idéal pour avancer dans votre parcours.", sugg: [["parcours", null], ["resp", "coherence"]] },
    fatigue: { msg: "Fatigué ? Une séance douce ou une respiration énergisante, sans forcer.", sugg: [["emotion", "fatigue"], ["resp", "energie"]] },
    stresse: { msg: "Vous semblez stressé. Une cohérence cardiaque pourrait vraiment aider.", sugg: [["resp", "coherence"], ["emotion", "stress"]] },
    deborde: { msg: "Débordé ? Deux minutes de pause valent mieux qu'aucune.", sugg: [["express", "x7"], ["express", "x2"]] },
    sommeil: { msg: "Besoin de dormir ? Préparons la nuit en douceur.", sugg: [["emotion", "sommeil"], ["resp", "sommeil478"]] },
    agace:   { msg: "L'agacement est une vague. Laissons-la retomber.", sugg: [["emotion", "colere"], ["resp", "apaisement"]] },
    triste:  { msg: "Prenez soin de vous. Une séance douce, sans rien à réussir.", sugg: [["emotion", "tristesse"], ["express", "x6"]] }
  },

  /* ---------- TEXTES D'ENCOURAGEMENT FIN DE SÉANCE ---------- */
  felicitations: [
    "Merci pour ce moment.",
    "Chaque séance compte. Celle-ci aussi.",
    "Vous venez d'offrir une vraie pause à votre esprit.",
    "Bien joué. La régularité se construit séance après séance.",
    "Quelques minutes de présence : c'est précieux, et c'est fait."
  ],

  /* ---------- ONBOARDING : objectifs & moments ---------- */
  objectifs: [
    { id: "stress",  label: "Réduire mon stress", icone: "🌊" },
    { id: "dormir",  label: "Mieux dormir", icone: "🌙" },
    { id: "concentration", label: "Améliorer ma concentration", icone: "🎯" },
    { id: "calme",   label: "Développer mon calme", icone: "🍃" },
    { id: "decouvrir", label: "Découvrir la méditation", icone: "🌱" }
  ],
  durees: [3, 5, 10, 15],
  moments: [
    { id: "cafe",    label: "Après le café", icone: "☕" },
    { id: "petitdej",label: "Après le petit-déjeuner", icone: "🥐" },
    { id: "dejeuner",label: "Après le déjeuner", icone: "🍽️" },
    { id: "retour",  label: "En rentrant du travail", icone: "🏠" },
    { id: "coucher", label: "Avant de dormir", icone: "🌙" },
    { id: "perso",   label: "Personnalisé", icone: "✨" }
  ],

  /* ---------- ANCRES DU JOUR ---------- */
  /* Rotation quotidienne selon l'heure : matin / après-midi / soir */
  ancresJour: {
    matin: [
      { icone: "☕", texte: "Ce matin : prenez 3 respirations avant de consulter votre téléphone." },
      { icone: "🌅", texte: "Ce matin : regardez par la fenêtre 30 secondes, sans rien faire d'autre." },
      { icone: "🚿", texte: "Ce matin : soyez présent sous la douche — la chaleur, l'eau, le son." },
      { icone: "☕", texte: "Ce matin : buvez la première gorgée de café sans écran." },
      { icone: "🌿", texte: "Ce matin : sentez vos pieds au sol avant de vous lever." },
      { icone: "🌬️", texte: "Ce matin : cinq expirations longues avant de quitter la maison." },
      { icone: "🧘", texte: "Ce matin : une minute assise, dos droit, avant de commencer la journée." }
    ],
    apresmidi: [
      { icone: "🍃", texte: "Cet après-midi : levez les yeux de votre écran et regardez au loin 20 secondes." },
      { icone: "💧", texte: "Cet après-midi : buvez un verre d'eau lentement, en pleine conscience." },
      { icone: "🚶", texte: "Cet après-midi : marchez plus lentement que d'habitude lors de votre prochain trajet." },
      { icone: "🌬️", texte: "Cet après-midi : trois respirations profondes avant de répondre à un message tendu." },
      { icone: "🔔", texte: "Cet après-midi : respirez une fois avant de décrocher votre téléphone." },
      { icone: "☀️", texte: "Cet après-midi : trouvez 2 minutes loin des écrans — juste regarder, écouter." },
      { icone: "🤲", texte: "Cet après-midi : posez les mains à plat et sentez leur contact avec la surface." }
    ],
    soir: [
      { icone: "🌙", texte: "Ce soir : posez votre téléphone 10 minutes avant de dormir." },
      { icone: "🕯️", texte: "Ce soir : quel a été le meilleur moment de votre journée, même minuscule ?" },
      { icone: "🌬️", texte: "Ce soir : cinq expirations lentes pour mettre fin à la journée." },
      { icone: "🌟", texte: "Ce soir : pensez à une chose pour laquelle vous êtes reconnaissant." },
      { icone: "📖", texte: "Ce soir : lisez quelques pages d'un livre (pas d'écran) avant de dormir." },
      { icone: "🌸", texte: "Ce soir : vous avez fait de votre mieux aujourd'hui. C'est suffisant." },
      { icone: "🛁", texte: "Ce soir : lors de votre routine du soir, faites une seule chose à la fois." }
    ]
  }
};
