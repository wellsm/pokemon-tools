import type { Dictionary } from './en'

export const pt: Dictionary = {
  common: {
    cancel: 'Cancelar',
    delete: 'Apagar',
    save: 'Salvar',
    remove: 'Remover',
    edit: 'Editar',
  },
  header: {
    settings: 'Configurações',
  },
  index: {
    binder: {
      title: 'Gerenciador de Binders',
      subtitle: 'Gerencie coleções e master sets.',
      cta: 'Iniciar',
    },
    battle: {
      title: 'Assistente de Batalha',
      subtitle: 'Acompanhe dano, status e energia.',
      cta: 'Iniciar Interface',
      inProgress: 'Em andamento',
    },
  },
  binderList: {
    headerTitle: 'Gerenciador de Binders',
    title: 'Minha Coleção',
    subtitle: 'Gerencie seus binders e acompanhe o progresso do seu deck competitivo.',
    empty: 'Nenhum binder ainda. Toque + para criar um.',
    fabLabel: 'Novo binder',
  },
  binderDetail: {
    notFoundTitle: 'Não encontrado',
    notFoundBody: 'Binder não encontrado.',
    backToBinders: 'Voltar aos binders',
    settingsLabel: 'Configurações do binder',
  },
  folderCard: {
    editAria: 'Editar binder',
  },
  binderEdit: {
    title: 'Editar binder',
    name: 'Nome',
    namePlaceholder: 'Nome do binder',
    cover: {
      label: 'Pokémon de capa (opcional)',
      searchPlaceholder: 'Buscar por nome ou #id…',
      remove: 'Remover capa',
    },
    save: 'Salvar alterações',
    delete: 'Apagar binder',
    deleteConfirm: {
      title: (name: string) => `Apagar "${name}"?`,
      body: 'Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      confirm: 'Apagar',
    },
  },
  create: {
    title: 'Novo binder',
    region: 'Região',
    name: 'Nome',
    grid: 'Grade',
    submit: 'Criar binder',
    defaultName: (region: string) => `Pokédex – ${region}`,
  },
  search: {
    placeholder: '3 letras ou número...',
    notFound: 'Não encontrado',
    tooShort: 'Digite pelo menos 3 letras',
    clear: 'Limpar busca',
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Próxima página',
  },
  play: {
    headerTitle: 'Assistente de Batalha',
    landing: {
      continueLabel: 'Continuar batalha',
      matchInProgress: 'Partida em andamento',
      startedAtPrefix: 'iniciada',
      prizeLabel: 'prêmio',
      continue: 'Continuar',
      newBattle: 'Nova partida',
      newBattleDiscards: 'Nova partida (descarta atual)',
      timeAgo: {
        now: 'agora',
        minutes: (n: number) => `há ${n}min`,
        hours: (h: number, m: number) => (m ? `há ${h}h ${m}min` : `há ${h}h`),
      },
    },
    setup: {
      headerTitle: 'Nova partida',
      format: 'Formato',
      standard: 'Standard',
      pocket: 'Pocket',
      benchInfo: (n: number) => `1 ativo + ${n} reserva`,
      modules: 'Módulos',
      coins: { label: '🪙 Moedas', desc: 'Lance 1 ou mais moedas' },
      energy: { label: '⚡ Gerador de Energia', desc: '1 energia/turno (Pocket)' },
      board: { label: '🎯 Tabuleiro de Dano', desc: 'Marcadores por slot' },
      energiesLabel: (count: number, max: number) => `Energias (${count}/${max})`,
      start: 'Iniciar partida',
    },
    match: {
      defaultTitle: 'Partida',
      opponentPrefix: 'vs',
      settingsLabel: 'Configurações da partida',
    },
    matchSettings: {
      title: 'Configurações da partida',
      endMatch: 'Encerrar partida',
      endConfirm: {
        title: 'Encerrar partida?',
        body: 'O histórico será apagado.',
        cancel: 'Cancelar',
        confirm: 'Encerrar',
      },
    },
    discardConfirm: {
      title: 'Descartar partida atual?',
      body: 'Iniciar uma nova partida encerra a atual.',
      cancel: 'Cancelar',
      confirm: 'Descartar e iniciar',
    },
    endGameConfirm: {
      title: 'Encerrar jogo?',
      body: 'Todo o progresso será perdido.',
      cancel: 'Cancelar',
      confirm: 'Encerrar',
    },
  },
  settings: {
    title: 'Configurações',
    theme: {
      heading: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema',
    },
    language: {
      heading: 'Idioma',
      en: 'English',
      pt: 'Português',
    },
    data: {
      heading: 'Dados',
      clear: 'Apagar todos os dados',
      confirm: {
        title: 'Apagar todos os dados?',
        body: 'Apaga todos os binders, batalha em andamento e preferências. Não pode desfazer.',
        checkbox: 'Tenho certeza',
        cancel: 'Cancelar',
        delete: 'Apagar',
      },
    },
  },
}
