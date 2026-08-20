import QRCode from "qrcode"

const QR_SIZE = 200
const FONT_SIZE = 12
const TEXT_AREA_HEIGHT = 28

const A4_WIDTH = 794
const A4_HEIGHT = 1123
const A4_MARGIN = 38
const COLS = 3
const ROWS = 4

export interface QrPeserta {
  NIB: string
  NamaPeserta: string
}

async function drawQrCard(
  ctx: CanvasRenderingContext2D,
  nib: string,
  nama: string,
  x: number,
  y: number
): Promise<void> {
  const qrCanvas = document.createElement("canvas")
  await QRCode.toCanvas(qrCanvas, nib, { width: QR_SIZE, margin: 2 })

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(x, y, QR_SIZE, QR_SIZE + TEXT_AREA_HEIGHT)
  ctx.drawImage(qrCanvas, x, y)

  ctx.font = `bold ${FONT_SIZE}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#000000"

  const maxWidth = QR_SIZE - 16
  let text = nama
  if (ctx.measureText(text).width > maxWidth) {
    while (ctx.measureText(text + "…").width > maxWidth && text.length > 0) {
      text = text.slice(0, -1)
    }
    text += "…"
  }

  ctx.fillText(text, x + QR_SIZE / 2, y + QR_SIZE + TEXT_AREA_HEIGHT / 2)

  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1.5
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)"
  ctx.strokeRect(x + 3, y + 3, QR_SIZE - 6, QR_SIZE + TEXT_AREA_HEIGHT - 6)
  ctx.setLineDash([])
}

export async function generateQrCodeUrl(nib: string, nama: string): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = QR_SIZE
  canvas.height = QR_SIZE + TEXT_AREA_HEIGHT
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D tidak didukung")

  await drawQrCard(ctx, nib, nama, 0, 0)
  return canvas.toDataURL("image/png")
}

export async function generateA4Sheets(pesertaList: QrPeserta[]): Promise<string[]> {
  const sheets: string[] = []
  const cardsPerSheet = COLS * ROWS

  for (let i = 0; i < pesertaList.length; i += cardsPerSheet) {
    const canvas = document.createElement("canvas")
    canvas.width = A4_WIDTH
    canvas.height = A4_HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D tidak didukung")

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

    const slotW = (A4_WIDTH - A4_MARGIN * 2) / COLS
    const slotH = (A4_HEIGHT - A4_MARGIN * 2) / ROWS
    const cardX = (slotW - QR_SIZE) / 2
    const cardY = (slotH - (QR_SIZE + TEXT_AREA_HEIGHT)) / 2

    const batch = pesertaList.slice(i, i + cardsPerSheet)
    for (let j = 0; j < batch.length; j++) {
      const col = j % COLS
      const row = Math.floor(j / COLS)
      await drawQrCard(
        ctx,
        batch[j].NIB,
        batch[j].NamaPeserta,
        A4_MARGIN + col * slotW + cardX,
        A4_MARGIN + row * slotH + cardY
      )
    }
    sheets.push(canvas.toDataURL("image/png"))
  }
  return sheets
}