export type OrganizerRecord = {
  id: string;
  slug: string;
  displayName: string;
  about?: string;
};

export type OrganizerSummary = Pick<
  OrganizerRecord,
  'id' | 'slug' | 'displayName'
>;
