# Pokédex TCG — Ferramentas para Jogadores

**Data**: 2026-04-11
**Status**: Aprovado

## Visão Geral

Expandir o app de colecionador Pokédex TCG para incluir uma segunda vertente: **ferramentas para jogadores**. O app passa a ter duas abas principais — **Coleção** (funcionalidade atual) e **Jogar** (nova).

A aba Jogar oferece uma mesa de jogo modular com três ferramentas independentes que podem ser ativadas/desativadas conforme a necessidade:

1. **Tabuleiro de Dano** — campo espelhado (você + adversário) com slots em formato de carta e contadores de dano
2. **Jogar Moedas** — flip de 1 ou mais moedas com animação e resultado
3. **Gerador de Energia** — geração aleatória de energia por turno (modo Pocket)

## Formatos Suportados

### TCG Standard
- 1 Pokémon ativo + 5 no banco (ajustável por cartas especiais)
- Energia vem de cartas — **gerador desabilitado**
- Moedas habilitadas
- Slots extras do banco vão em nova linha abaixo

### TCG Pocket
- 1 Pokémon ativo + 3 no banco
- Máximo 3 tipos de energia por deck
- 1 energia gerada aleatoriamente por turno (obrigatória), com possibilidade de energia extra via cartas
- Moedas habilitadas

### 8 Tipos de Energia Básica
Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal

## Navegação

### Estrutura
- **Bottom tab bar** no mobile (2 abas: Coleção | Jogar)
- **Top navigation bar** no desktop (logo + abas)
- Rota `/` redireciona para `/colecao`

### Rotas
```
/colecao        — Lista de fichários (home atual)
/colecao/:id    — Visualizar fichário
/jogar          — Mesa de jogo
```

### Fase 2 (fora do escopo)
```
/colecao/mastersets — MasterSets com imagens de cartas via API
```

## Tela Jogar — Fluxo

### 1. Configuração (Setup)

Antes de iniciar a partida, o jogador configura:

1. **Formato**: Standard ou Pocket (toggle/seletor)
   - Selecionar formato pré-configura os defaults dos módulos e quantidade de slots
2. **Módulos**: toggles liga/desliga para cada ferramenta
   - Moedas: habilitado por padrão em ambos
   - Energia: habilitado por padrão no Pocket, desabilitado (cinza) no Standard
   - Tabuleiro: habilitado por padrão em ambos
3. **Seleção de Energias** (se módulo de energia ativo): selecionar até 3 tipos de energia do pool de 8
4. **Botão "Iniciar Partida"**: salva configuração e abre a mesa

### 2. Mesa Ativa (Durante o Jogo)

#### Layout do Campo

O campo ocupa a tela inteira com layout espelhado:

```
        Adversário
   B1  B2  B3  B4  B5
        [Ativo]
      ─── VS ───
        [Ativo]
   B1  B2  B3  B4  B5
         Você
```

- Slots em formato de carta (pequenos, ~50×70px)
- Cada slot exibe: label (B1, B2..., Ativo), dano acumulado, energias atreladas (bolinhas miniatura)
- Adversário no topo (tema vermelho), Você embaixo (tema verde)
- Slots extras do banco (quando > 5) aparecem em nova linha abaixo
- Pocket mostra apenas 3 slots no banco

#### Interação com Slot

Ao tocar num slot, abre popover/bottom sheet com:
- Contador de dano: botões −20, −10, **valor**, +10, +20
- Energias atreladas: bolinhas dos tipos + botão "+" para adicionar
- Botões: "Limpar dano", "Mover" (trocar posição)

#### Reordenação de Slots
- Slots podem ser reposicionados (drag ou botões) para espelhar o tabuleiro físico
- Trocar entre ativo e banco: ao mover um bench para ativo, o ativo atual vai para a posição do bench (swap)

#### Adicionar/Remover Slots
- Botões "+ Slot" / "− Slot" no header do tabuleiro para cada lado
- Permite ajustar para cartas que alteram tamanho do banco

#### Elementos Flutuantes (position: absolute)

**Botão de Moeda** (canto inferior esquerdo):
- Botão circular dourado com ícone 🪙
- Ao clicar, abre bottom sheet modal

**Indicador de Energia** (se módulo ativo):
- Canto inferior direito: próxima energia do jogador (bolinha + label "Próxima" + tipo)
- Canto superior esquerdo: próxima energia do adversário (espelhado)

### 3. Modal de Moedas (Bottom Sheet)

- Abre via botão flutuante 🪙
- **Seletor de quantidade**: −/+ com número central (default: 1)
- **Preview**: moedas com "?" antes do flip
- **Botão "Jogar!"**: executa a animação de flip
- **Resultado**: cada moeda mostra Cara (dourada, "C") ou Coroa (cinza, "K")
- **Resumo**: "X Cara · Y Coroa"
- **Botão "Jogar Novamente"**: permite re-flip com mesma quantidade
- Animação: CSS 3D flip satisfatória (~1s)

### 4. Gerador de Energia

- A cada turno, ao clicar "Gerar", sorteia 1 energia aleatória do `energyPool` selecionado no setup
- A energia gerada fica visível no indicador flutuante até ser atrelada a um slot
- Botão "Próximo Turno" avança o contador de turno e reseta a energia disponível
- Energia extra pode ser adicionada manualmente via popover do slot (para cartas que dão bypass)
- Espelhado para o adversário (mesmo comportamento)

## Modelo de Dados

### Store Separado: `useGameStore`

Separado do `useBinderStore` existente para isolamento. Usa Zustand com persist middleware (localStorage).

```typescript
type EnergyType = 'grass' | 'fire' | 'water' | 'lightning' |
                  'psychic' | 'fighting' | 'darkness' | 'metal'

type GameFormat = 'standard' | 'pocket'

interface GameModules {
  coins: boolean
  energy: boolean
  board: boolean
}

interface BoardSlot {
  id: string
  position: 'active' | 'bench'
  damage: number
  energies: EnergyType[]
}

interface FieldSide {
  slots: BoardSlot[]
}

interface GameState {
  // Configuração
  format: GameFormat
  modules: GameModules
  energyPool: EnergyType[]        // tipos selecionados (max 3 Pocket)

  // Estado em jogo
  active: boolean                  // partida em andamento
  turn: number
  myField: FieldSide
  opponentField: FieldSide
  currentEnergy: EnergyType | null    // energia gerada neste turno (minha)
  opponentEnergy: EnergyType | null   // energia gerada (adversário)

  // Ações — Jogo
  startGame: () => void
  endGame: () => void
  nextTurn: () => void
  generateEnergy: (side: 'my' | 'opponent') => void

  // Ações — Board
  addDamage: (side: 'my' | 'opponent', slotId: string, amount: number) => void
  clearDamage: (side: 'my' | 'opponent', slotId: string) => void
  attachEnergy: (side: 'my' | 'opponent', slotId: string, energy: EnergyType) => void
  removeEnergy: (side: 'my' | 'opponent', slotId: string, index: number) => void
  addSlot: (side: 'my' | 'opponent') => void
  removeSlot: (side: 'my' | 'opponent', slotId: string) => void
  moveSlot: (side: 'my' | 'opponent', slotId: string, newPosition: 'active' | 'bench') => void
  reorderSlots: (side: 'my' | 'opponent', fromIndex: number, toIndex: number) => void

  // Ações — Coins (resultado efêmero, sem persistência)
  flipCoins: (count: number) => boolean[]
}
```

### Defaults por Formato

**startGame()** configura:

| | Standard | Pocket |
|---|---|---|
| Slots "Você" | 1 ativo + 5 bench | 1 ativo + 3 bench |
| Slots "Adversário" | 1 ativo + 5 bench | 1 ativo + 3 bench |
| Módulo Energia | desabilitado | habilitado |
| Módulo Moedas | habilitado | habilitado |
| Módulo Tabuleiro | habilitado | habilitado |

### Persistência

- Estado da partida salvo em localStorage via Zustand persist (key: `pokedex-tcg-game`)
- Fechar e reabrir o navegador retoma a partida em andamento
- `endGame()` limpa o estado

## Arquitetura de Componentes

```
App (com Layout de Tab Bar)
├── /colecao
│   ├── Home (lista fichários — existente)
│   └── BinderView (visualizar fichário — existente)
└── /jogar
    ├── GameSetup (configuração antes da partida)
    │   ├── FormatSelector (Standard/Pocket)
    │   ├── ModuleToggles (moedas/energia/tabuleiro)
    │   └── EnergySelector (grid de 8 tipos, max 3)
    └── GameTable (mesa ativa)
        ├── FieldSide × 2 (adversário + você)
        │   └── BoardSlot × N (slots em formato carta)
        ├── SlotPopover (dano + energia ao tocar slot)
        ├── CoinButton (flutuante, abre modal)
        ├── CoinModal (bottom sheet com flip)
        └── EnergyIndicator × 2 (flutuante, próxima energia)
```

### Componentes Novos de UI

- **TabBar**: bottom tab bar mobile / top nav desktop (componente de layout)
- **GameSetup**: página de configuração da partida
- **GameTable**: página da mesa ativa
- **FieldSide**: metade do campo (grupo de slots)
- **BoardSlot**: slot individual em formato carta
- **SlotPopover**: popover/sheet de interação com slot
- **CoinButton**: FAB flutuante
- **CoinModal**: bottom sheet para jogar moedas (com animação)
- **EnergyIndicator**: indicador flutuante de próxima energia

### Componentes Reutilizados
- Switch (shadcn) — toggles de módulos
- Button, Sheet/Drawer — já existentes
- `useIsMobile()` hook — responsividade

## Visual

- **Minimalista e funcional** — sem decoração temática extra
- Consistente com o tema escuro atual do app
- Cores por contexto: verde (você), vermelho (adversário), dourado (moedas), azul (energia/UI)
- Ícones de energia: emojis ou SVGs simples por tipo

## Fora do Escopo (Fase 2+)

- MasterSets com imagens via API
- Busca de Pokémon para associar ao slot do tabuleiro
- Imagens de Pokémon nos slots
- Histórico de partidas
- Múltiplas partidas salvas
- Timer de turno
