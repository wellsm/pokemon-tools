export const en = {
  common: {
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    remove: 'Remove',
    edit: 'Edit',
  },
  header: {
    settings: 'Settings',
  },
  index: {
    binder: {
      title: 'Binder Manager',
      subtitle: 'Manage collections & master sets.',
      cta: 'Initialize Data',
    },
    battle: {
      title: 'Battle Assistant',
      subtitle: 'Track damage, status & energy.',
      cta: 'Launch Interface',
      inProgress: 'In Progress',
    },
  },
  binderList: {
    headerTitle: 'Binder Manager',
    title: 'My Collection',
    subtitle: 'Manage your binders and track competitive deck progress.',
    empty: 'No binders yet. Tap + to create one.',
    fabLabel: 'New binder',
  },
  binderDetail: {
    notFoundTitle: 'Not Found',
    notFoundBody: 'Binder not found.',
    backToBinders: 'Back to binders',
    settingsLabel: 'Binder settings',
  },
  folderCard: {
    editAria: 'Edit binder',
  },
  binderEdit: {
    title: 'Edit binder',
    name: 'Name',
    namePlaceholder: 'Binder name',
    cover: {
      label: 'Cover Pokemon (optional)',
      searchPlaceholder: 'Search by name or #id…',
      remove: 'Remove cover',
    },
    save: 'Save changes',
    delete: 'Delete binder',
    deleteConfirm: {
      title: (name: string) => `Delete "${name}"?`,
      body: 'This cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
  },
  create: {
    title: 'New binder',
    region: 'Region',
    name: 'Name',
    grid: 'Grid',
    submit: 'Create binder',
    defaultName: (region: string) => `Pokédex – ${region}`,
  },
  search: {
    placeholder: '3 letters or number...',
    notFound: 'Not found',
    tooShort: 'Type at least 3 letters',
    clear: 'Clear search',
  },
  pagination: {
    previous: 'Previous page',
    next: 'Next page',
  },
  play: {
    headerTitle: 'Battle Assistant',
    landing: {
      continueLabel: 'Continue Battle',
      matchInProgress: 'Match in progress',
      startedAtPrefix: 'started',
      prizeLabel: 'prize',
      continue: 'Continue',
      newBattle: 'New Battle',
      newBattleDiscards: 'New Battle (discards current)',
      timeAgo: {
        now: 'now',
        minutes: (n: number) => `${n}m ago`,
        hours: (h: number, m: number) => (m ? `${h}h ${m}m ago` : `${h}h ago`),
      },
    },
    setup: {
      headerTitle: 'New Battle',
      format: 'Format',
      standard: 'Standard',
      pocket: 'Pocket',
      benchInfo: (n: number) => `1 active + ${n} bench`,
      modules: 'Modules',
      coins: { label: '🪙 Coins', desc: 'Flip 1 or more coins' },
      energy: { label: '⚡ Energy Generator', desc: '1 energy/turn (Pocket)' },
      board: { label: '🎯 Damage Board', desc: 'Counters per slot' },
      energiesLabel: (count: number, max: number) => `Energies (${count}/${max})`,
      start: 'Start Game',
    },
    match: {
      defaultTitle: 'Match',
      opponentPrefix: 'vs',
      settingsLabel: 'Match settings',
    },
    matchSettings: {
      title: 'Match Settings',
      endMatch: 'End Match',
      endConfirm: {
        title: 'End match?',
        body: 'History will be cleared.',
        cancel: 'Cancel',
        confirm: 'End',
      },
    },
    discardConfirm: {
      title: 'Discard current match?',
      body: 'Starting a new match will end the current one.',
      cancel: 'Cancel',
      confirm: 'Discard & start',
    },
    endGameConfirm: {
      title: 'End game?',
      body: 'All progress will be lost.',
      cancel: 'Cancel',
      confirm: 'End',
    },
  },
  settings: {
    title: 'Settings',
    theme: {
      heading: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    language: {
      heading: 'Language',
      en: 'English',
      pt: 'Português',
    },
    data: {
      heading: 'Data',
      clear: 'Clear all data',
      confirm: {
        title: 'Delete all data?',
        body: 'Removes all binders, ongoing match, and preferences. This cannot be undone.',
        checkbox: 'I understand',
        cancel: 'Cancel',
        delete: 'Delete',
      },
    },
  },
}

export type Dictionary = typeof en
