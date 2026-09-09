import type { Dictionary } from './en';

export const fr = {
  metadata: {
    title: 'Découvrir des événements — Prototype',
    description:
      'Découvrez des événements prototypes fictifs en Sierra Leone, au Ghana et en Côte d’Ivoire.',
  },
  navigation: {
    platform: 'Événements',
    discover: 'Découvrir',
    skip: 'Aller au contenu',
    prototype: 'Prototype fictif',
  },
  market: {
    country: 'Pays',
    language: 'Langue',
    updating: 'Mise à jour de la sélection…',
  },
  discovery: {
    eyebrow: 'ÉVÉNEMENTS / DÉCOUVERTE',
    title: 'À l’affiche à',
    subtitle: 'Trouvez une soirée, une scène ou un lieu qui vous ressemble.',
    searchLabel: 'Rechercher des événements',
    searchPlaceholder: 'Titre, lieu, ville ou organisateur',
    searchButton: 'Rechercher',
    clearSearch: 'Effacer la recherche',
    featured: 'À la une',
    upcoming: 'Événements à venir',
    categories: 'Catégories',
    all: 'Tout',
    results: 'événements trouvés',
    oneResult: 'événement trouvé',
    noMatches: 'Aucun événement ne correspond à votre recherche.',
    noMatchesDetail:
      'Essayez une autre recherche ou effacez le filtre de catégorie.',
    invalidCountry:
      'Ce pays n’est pas pris en charge. La Sierra Leone est sélectionnée à la place.',
    invalidCategory:
      'Cette catégorie n’est pas disponible. Tous les événements sont affichés.',
  },
  event: {
    from: 'À partir de',
    at: 'à',
    by: 'Par',
    details: 'Détails de l’événement',
    tickets: 'Billets',
    venue: 'Lieu',
    organizer: 'Organisateur',
    date: 'Date',
    time: 'Horaire',
    age: 'Âge',
    refund: 'Conditions d’annulation et de remboursement',
    back: 'Retour à la découverte',
    getTickets: 'Prendre des billets',
    purchasingLater: 'L’achat de billets arrivera dans un prochain sprint.',
    remaining: 'restants',
  },
  availability: {
    AVAILABLE: 'Disponible',
    SOLD_OUT: 'Complet',
    SALE_NOT_STARTED: 'Vente bientôt ouverte',
    SALE_ENDED: 'Vente terminée',
  },
  categories: {
    CONCERTS: 'Concerts',
    PARTIES: 'Soirées',
    FESTIVALS: 'Festivals',
    NIGHTLIFE: 'Vie nocturne',
    SPORTS: 'Sports',
    ARTS_CULTURE: 'Arts et culture',
    CONFERENCES: 'Conférences',
    OTHER: 'Autre',
  },
  footer: {
    scope: 'Données fictives du Sprint 1',
    policy: 'L’achat n’est pas disponible dans ce prototype.',
  },
  loading: {
    title: 'Chargement des événements…',
    detail: 'Préparation de la découverte pour le pays sélectionné.',
  },
  error: {
    title: 'Cette vue n’a pas pu être chargée.',
    detail: 'Réessayez ou revenez à la découverte des événements.',
    retry: 'Réessayer',
    home: 'Retour à la découverte',
  },
  notFound: {
    title: 'Cet événement n’est pas disponible.',
    detail: 'Il n’est peut-être pas publié ou l’adresse est incorrecte.',
  },
} satisfies Dictionary;
