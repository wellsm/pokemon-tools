export interface BinderConfig {
  cols: number;
  rows: number;
  back: boolean;
}

export interface SlotPosition {
  page: number;
  side: 'front' | 'back';
  row: number;
  col: number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function parseFormat(formatStr: string): { cols: number; rows: number } {
  const match = formatStr.match(/^(\d+)x(\d+)$/i)
  if (!match) {
    throw new ValidationError(
      `Invalid format "${formatStr}". Use COLSxROWS (e.g.: "3x3", "4x3", "5x4").`
    )
  }
  const cols = parseInt(match[1], 10)
  const rows = parseInt(match[2], 10)
  if (cols < 1 || rows < 1)
    throw new ValidationError(`Dimensions must be at least 1x1.`)
  if (cols > 10 || rows > 10)
    throw new ValidationError(`Maximum dimensions: 10x10.`)
  return { cols, rows }
}

export function calculatePosition(pokemonId: number, config: BinderConfig): SlotPosition {
  const slotsPerPage = config.rows * config.cols
  const pageIndex = Math.floor((pokemonId - 1) / slotsPerPage)
  const page = pageIndex + 1
  const posInPage = (pokemonId - 1) % slotsPerPage
  // odd page index = back side of a sheet (when back=true)
  const side: 'front' | 'back' = config.back && pageIndex % 2 === 1 ? 'back' : 'front'
  const row = Math.floor(posInPage / config.cols) + 1
  const col = (posInPage % config.cols) + 1

  return { page, side, row, col }
}

export function totalPages(totalSlots: number, config: BinderConfig): number {
  return Math.ceil(totalSlots / (config.rows * config.cols))
}

export function pageCapacity(config: BinderConfig): number {
  return config.rows * config.cols
}

export function slotRangeForPage(
  page: number,
  config: BinderConfig
): { start: number; end: number } {
  const cap = pageCapacity(config)
  return {
    start: (page - 1) * cap,
    end: page * cap - 1,
  }
}
