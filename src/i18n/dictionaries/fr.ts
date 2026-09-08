import type { Dictionary } from './en';

export const fr = {
  metadata: {
    title: 'Plateforme — Sprint 0',
    description:
      'Les fondations techniques et visuelles d’une plateforme de billetterie pour plusieurs pays.',
  },
  navigation: {
    platform: 'Plateforme',
    foundation: 'Fondations',
    skip: 'Aller au contenu',
  },
  intro: {
    eyebrow: 'SPRINT 0 / FONDATIONS',
    title: 'L’affiche s’exprime.\nLa plateforme lui fait place.',
    description:
      'Des fondations communes à la Sierra Leone, au Ghana et à la Côte d’Ivoire. Explorez les pays, les langues et le système visuel.',
    scope: 'Aperçu des fondations · Aucun événement ni achat pour le moment',
  },
  controls: {
    title: 'Choisissez votre contexte',
    country: 'Pays',
    language: 'Langue',
    help: 'Changer de pays sélectionne sa langue par défaut. Vous pouvez ensuite choisir une autre langue sans changer de devise.',
    currency: 'Devise',
    locale: 'Format régional',
    updating: 'Mise à jour de votre sélection…',
    selected: 'Sélection actuelle',
    invalid:
      'Ce pays n’est pas pris en charge. La Sierra Leone est sélectionnée à la place.',
  },
  artwork: {
    eyebrow: '01 / ESPACE POUR L’AFFICHE',
    title: 'Place à l’expression.',
    placeholder: 'L’affiche de l’événement trouvera sa place ici.',
    note: 'Un espace vide pour l’affiche d’un futur événement. Ce n’est pas une annonce.',
    caption: 'Une interface discrète. L’affiche apporte la couleur.',
    ratio: 'ESPACE AFFICHE / 4:5',
  },
  interaction: {
    eyebrow: '02 / INTERACTION',
    title: 'Chaque étape est claire.',
    description:
      'Essayez une action simple pour voir le retour visuel. Le focus clavier et les boutons désactivés font partie du même système.',
    primary: 'Afficher le retour',
    secondary: 'Réinitialiser',
    disabled: 'Indisponible',
    pending: 'En cours…',
    idle: 'Aucune action pour le moment. Essayez « Afficher le retour ».',
    success: 'L’action de démonstration est terminée.',
    successLabel: 'SUCCÈS',
    warningLabel: 'ATTENTION',
    warning: 'Un exemple qui nécessite votre attention.',
    errorLabel: 'ERREUR',
    error: 'Un exemple à corriger.',
    focusHint:
      'Utilisez Tab pour passer d’un contrôle à l’autre. Chaque état possède un libellé.',
  },
  system: {
    eyebrow: '03 / FONDATIONS COMMUNES',
    title: 'Un système. Trois pays.',
    countries: 'Configuration des pays',
    countriesDetail:
      'Devises, valeurs par défaut et moyens disponibles dans un registre typé.',
    languages: 'Dictionnaires de traduction',
    languagesDetail:
      'Anglais et français aujourd’hui, avec la possibilité d’ajouter d’autres langues.',
    database: 'PostgreSQL + Prisma',
    databaseDetail:
      'Uniquement les identifiants des pays. La connexion est vérifiée séparément.',
    tokens: 'Couleurs sémantiques',
    tokensDetail:
      'Surfaces, textes, actions et retours partagent une même palette.',
    surface: 'Surface',
    text: 'Texte',
    action: 'Action',
    accent: 'Expression',
  },
  footer: {
    scope: 'Sprint 0 uniquement',
    next: 'Prochaine étape prévue : événements',
    policy: 'La politique financière n’est pas configurée.',
  },
  loading: {
    title: 'Chargement de votre contexte…',
    detail: 'Préparation des fondations dans la langue sélectionnée.',
  },
  error: {
    title: 'Cette page n’a pas pu être chargée.',
    detail:
      'Réessayez. Le pays et la langue sélectionnés sont conservés dans l’adresse.',
    retry: 'Réessayer',
    home: 'Retour aux fondations',
  },
  notFound: {
    title: 'Cette page n’est pas disponible.',
    detail:
      'Revenez aux fondations pour sélectionner un pays et une langue pris en charge.',
  },
} satisfies Dictionary;
