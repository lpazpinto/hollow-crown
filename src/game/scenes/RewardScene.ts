import Phaser from 'phaser'
import {
  addCardToRunDeck,
  advanceFloorAfterEncounter,
  consumeForgeAvailabilityForShardReward,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'
import {
  getCardBaseId,
  generateRewardChoices,
  getCardById,
  getCardType,
  type CardContent,
  type RewardEncounterType,
} from '../content/cards'

type RewardSceneData = {
  encounterType?: RewardEncounterType
  mode?: 'standard' | 'boss-signature' | 'shard-forge'
  routeName?: string
  bossId?: string
  signatureCardId?: string | null
  nextScene?: 'MapScene' | 'RunEndScene' | 'RelicRewardScene'
  advanceFloorOnSelect?: boolean
}

const CARD_VISUAL_ASSETS: Array<{ key: string, path: string }> = [
  { key: 'card-frame-attack', path: 'assets/cards/frame-attack.png' },
  { key: 'card-frame-defense', path: 'assets/cards/frame-defense.png' },
  { key: 'card-frame-utility', path: 'assets/cards/frame-utility.png' },
  { key: 'card-cost-energy', path: 'assets/cards/ui-cost/energy-variant-e-borderless-minimal.png' },
  { key: 'card-cost-ember', path: 'assets/cards/ui-cost/ember-variant-f-borderless-flame-gem.png' },
  { key: 'card-rarity-overlay-common', path: 'assets/cards/rarity-overlay-common.png' },
  { key: 'card-rarity-overlay-uncommon', path: 'assets/cards/rarity-overlay-uncommon.png' },
  { key: 'card-rarity-overlay-rare', path: 'assets/cards/rarity-overlay-rare.png' },
  { key: 'card-rarity-gems-uncommon', path: 'assets/cards/rarity-gems-uncommon.png' },
  { key: 'card-rarity-gems-rare', path: 'assets/cards/rarity-gems-rare.png' },
  { key: 'card-art-unicorn-strike', path: 'assets/cards/art-unicorn-strike.png' },
  { key: 'card-art-golden-shield', path: 'assets/cards/art-golden-shield.png' },
  { key: 'card-art-charge', path: 'assets/cards/art-charge.png' },
  { key: 'card-art-crown-diamonds', path: 'assets/cards/art-crown-diamonds.png' },
  { key: 'card-art-bg-unicorn-strike', path: 'assets/cards/art-bg-unicorn-strike.png' },
  { key: 'card-art-bg-golden-shield', path: 'assets/cards/art-bg-golden-shield.png' },
  { key: 'card-art-bg-charge', path: 'assets/cards/art-bg-charge.png' },
  { key: 'card-art-bg-crown-diamonds', path: 'assets/cards/art-bg-crown-diamonds.png' },
  { key: 'card-art-fg-unicorn-strike', path: 'assets/cards/art-fg-unicorn-strike.png' },
  { key: 'card-art-fg-golden-shield', path: 'assets/cards/art-fg-golden-shield.png' },
  { key: 'card-art-fg-charge', path: 'assets/cards/art-fg-charge.png' },
  { key: 'card-art-fg-crown-diamonds', path: 'assets/cards/art-fg-crown-diamonds.png' },
]

export class RewardScene extends Phaser.Scene {
  private rewardChosen = false
  private encounterType: RewardEncounterType = 'battle'
  private mode: 'standard' | 'boss-signature' | 'shard-forge' = 'standard'
  private routeName = ''
  private bossId = ''
  private signatureCardId: string | null = null
  private nextScene: 'MapScene' | 'RunEndScene' | 'RelicRewardScene' = 'MapScene'
  private advanceFloorOnSelect = true

  constructor() {
    super('RewardScene')
  }

  preload() {
    CARD_VISUAL_ASSETS.forEach((asset) => {
      if (!this.textures.exists(asset.key)) {
        this.load.image(asset.key, asset.path)
      }
    })
  }

  create(data: RewardSceneData = {}) {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    this.rewardChosen = false
    this.encounterType = data.encounterType ?? 'battle'
    this.mode = data.mode ?? 'standard'
    this.routeName = data.routeName ?? ''
    this.bossId = data.bossId ?? ''
    this.signatureCardId = data.signatureCardId ?? null
    this.nextScene = data.nextScene ?? 'MapScene'
    this.advanceFloorOnSelect = data.advanceFloorOnSelect ?? true

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 40, this.mode === 'boss-signature' ? 'Signature Reward' : (this.mode === 'shard-forge' ? 'Shard Forge Reward' : 'Card Draft'), {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, this.mode === 'boss-signature'
      ? 'Boss defeated. Claim your signature card.'
      : (this.mode === 'shard-forge'
        ? '3/3 Shards reached. Choose a powerful forged card.'
        : 'Choose 1 card to deepen your run build'), {
      fontSize: '18px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 100, `Reward Type: ${this.encounterType.toUpperCase()}`, {
      fontSize: '16px',
      color: this.mode === 'shard-forge' ? '#fde68a' : '#93c5fd',
    }).setOrigin(0.5)

    this.add.text(width / 2, 122, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    if (this.mode === 'boss-signature') {
      this.add.text(width / 2, 146, `Route: ${this.routeName || 'Unknown Route'}  |  Boss: ${this.bossId || 'Unknown Boss'}`, {
        fontSize: compactLayout ? '14px' : '15px',
        color: '#fca5a5',
      }).setOrigin(0.5)
    } else if (this.mode === 'shard-forge') {
      this.add.text(width / 2, 146, 'Forged from shard progress. This payout is separate from normal battle drafts.', {
        fontSize: compactLayout ? '14px' : '15px',
        color: '#fde68a',
      }).setOrigin(0.5)
    }

    this.input.keyboard?.removeAllListeners('keydown-ESC')
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    try {
      const rewards = this.getRewardChoices()
      const spacing = this.mode === 'boss-signature' ? 0 : (compactLayout ? 200 : 230)
      const startX = width / 2 - ((rewards.length - 1) * spacing) / 2

      rewards.forEach((card, index) => {
        const x = startX + index * spacing
        this.createRewardCard(x, height / 2 + 40, compactLayout, card, () => {
          this.selectReward(card)
        })
      })
    } catch {
      this.add.text(width / 2, height / 2, 'Reward screen failed to load', {
        fontSize: '20px',
        color: '#fca5a5',
      }).setOrigin(0.5)
    }
  }

  private createRewardCard(x: number, y: number, compactLayout: boolean, cardData: CardContent, onClick: () => void) {
    const cardWidth = compactLayout ? 176 : 188
    const cardHeight = compactLayout ? 224 : 236
    const frameType = this.getCardFrameType(cardData)
    const frameKey = `card-frame-${frameType}`
    const overlayKey = `card-rarity-overlay-${cardData.rarity}`
    const gemsKey = cardData.rarity === 'common' ? null : `card-rarity-gems-${cardData.rarity}`
    const artBgKey = this.getCardArtBackgroundKey(cardData)
    const artKey = this.getCardArtKey(cardData)
    const artScaleModifier = getCardBaseId(cardData.id) === 'unicorn-strike' ? 0.9 : 1

    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xffffff, 0.001)
      .setStrokeStyle(0, 0x000000, 0)
      .setInteractive({ useHandCursor: true })

    const visuals: Phaser.GameObjects.GameObject[] = []
    const postFrameVisuals: Phaser.GameObjects.GameObject[] = []

    if (this.textures.exists(overlayKey)) {
      visuals.push(this.add.image(x, y, overlayKey).setDisplaySize(cardWidth, cardHeight))
    }

    const artWindowWidth = cardWidth - 28
    const artWindowHeight = compactLayout ? 72 : 78
    const artHoleInset = compactLayout ? 6 : 7
    const artHoleWidth = artWindowWidth - artHoleInset * 2
    const artHoleHeight = artWindowHeight - artHoleInset * 2
    const artWindow = this.add.rectangle(
      x,
      y - (compactLayout ? 18 : 20),
      artWindowWidth,
      artWindowHeight,
      0x0f172a,
      0,
    ).setStrokeStyle(0, 0x000000, 0)
    postFrameVisuals.push(artWindow)

    const artMaskShape = this.add.graphics()
    artMaskShape.fillStyle(0xffffff, 1)
    artMaskShape.fillRect(
      artWindow.x - artHoleWidth / 2,
      artWindow.y - artHoleHeight / 2,
      artHoleWidth,
      artHoleHeight,
    )
    artMaskShape.setVisible(false)
    const artMask = artMaskShape.createGeometryMask()
    postFrameVisuals.push(artMaskShape)

    const maxW = cardWidth - 32
    const maxH = compactLayout ? 66 : 72

    if (this.textures.exists(frameKey)) {
      const frameShadow = this.add.image(x + 2, y + 3, frameKey)
        .setDisplaySize(cardWidth, cardHeight)
        .setTintFill(0x000000)
        .setAlpha(0.34)
      postFrameVisuals.push(frameShadow)

      const frameImage = this.add.image(x, y, frameKey).setDisplaySize(cardWidth, cardHeight)
      postFrameVisuals.push(frameImage)
    }

    if (artBgKey && this.textures.exists(artBgKey)) {
      const artBgImage = this.add.image(x, artWindow.y, artBgKey)
      artBgImage.setDisplaySize(artHoleWidth * 1.16, artHoleHeight * 1.16)
      artBgImage.setMask(artMask)
      postFrameVisuals.push(artBgImage)

      // Inset-window inner shadows to fake recessed depth.
      const topShadow = this.add.rectangle(
        artWindow.x,
        artWindow.y - artHoleHeight / 2 + 2,
        artHoleWidth,
        compactLayout ? 6 : 7,
        0x000000,
        0.42,
      )
      topShadow.setMask(artMask)
      postFrameVisuals.push(topShadow)

      const leftShadow = this.add.rectangle(
        artWindow.x - artHoleWidth / 2 + 2,
        artWindow.y,
        compactLayout ? 6 : 7,
        artHoleHeight,
        0x000000,
        0.3,
      )
      leftShadow.setMask(artMask)
      postFrameVisuals.push(leftShadow)

      const ambientDarken = this.add.rectangle(
        artWindow.x,
        artWindow.y,
        artHoleWidth,
        artHoleHeight,
        0x000000,
        0.12,
      )
      ambientDarken.setMask(artMask)
      postFrameVisuals.push(ambientDarken)

      const bottomShadow = this.add.rectangle(
        artWindow.x,
        artWindow.y + artHoleHeight / 2 - 2,
        artHoleWidth,
        compactLayout ? 5 : 6,
        0x000000,
        0.26,
      )
      bottomShadow.setMask(artMask)
      postFrameVisuals.push(bottomShadow)

      const rightShadow = this.add.rectangle(
        artWindow.x + artHoleWidth / 2 - 2,
        artWindow.y,
        compactLayout ? 5 : 6,
        artHoleHeight,
        0x000000,
        0.26,
      )
      rightShadow.setMask(artMask)
      postFrameVisuals.push(rightShadow)

      const holeFrameDark = this.add.rectangle(
        artWindow.x,
        artWindow.y,
        artHoleWidth + 2,
        artHoleHeight + 2,
        0x000000,
        0,
      ).setStrokeStyle(2, 0x1a2437, 0.88)
      postFrameVisuals.push(holeFrameDark)

      const holeFrameLight = this.add.rectangle(
        artWindow.x,
        artWindow.y,
        artHoleWidth,
        artHoleHeight,
        0x000000,
        0,
      ).setStrokeStyle(1, 0x93a8bf, 0.36)
      postFrameVisuals.push(holeFrameLight)
    }

    if (artKey && this.textures.exists(artKey)) {
      const source = this.textures.get(artKey).getSourceImage() as { width: number, height: number }
      const scale = Math.min(maxW / source.width, maxH / source.height) * artScaleModifier

      const artShadow = this.add.image(x + 1.5, artWindow.y + 2.5, artKey)
      artShadow.setDisplaySize(source.width * scale * 0.9, source.height * scale * 0.9)
      artShadow.setTintFill(0x000000)
      artShadow.setAlpha(0.12)
      artShadow.setMask(artMask)
      postFrameVisuals.push(artShadow)

      const artImage = this.add.image(x, artWindow.y, artKey)
      artImage.setDisplaySize(source.width * scale, source.height * scale)
      postFrameVisuals.push(artImage)
    }

    if (gemsKey && this.textures.exists(gemsKey)) {
      postFrameVisuals.push(this.add.image(x, y, gemsKey).setDisplaySize(cardWidth, cardHeight))
    }

    const titlePlate = this.add.rectangle(
      x,
      y - cardHeight / 2 + (compactLayout ? 36 : 40),
      cardWidth - 56,
      compactLayout ? 22 : 24,
      0xf8fafc,
      0.8,
    ).setStrokeStyle(1, 0x1f2937, 0.35)

    const title = this.add.text(x, y - cardHeight / 2 + (compactLayout ? 36 : 40), cardData.title, {
      fontSize: compactLayout ? '15px' : '17px',
      color: '#111827',
      fontStyle: 'bold',
      wordWrap: { width: cardWidth - 24 },
      align: 'center',
    }).setOrigin(0.5)

    const bodyPlate = this.add.rectangle(
      x,
      y + (compactLayout ? 44 : 48),
      cardWidth - 40,
      compactLayout ? 58 : 64,
      0xf8fafc,
      0.7,
    ).setStrokeStyle(1, 0x475569, 0.28)

    const description = this.add.text(x, y + (compactLayout ? 44 : 48), cardData.description, {
      fontSize: compactLayout ? '12px' : '13px',
      color: '#111827',
      align: 'center',
      wordWrap: { width: cardWidth - 36 },
    }).setOrigin(0.5)

    const energyCost = cardData.cost
    const emberCost = cardData.emberCost ?? 0
    const hasEmberCost = emberCost > 0
    const costBadgeSize = compactLayout ? 36 : 38
    const energyGem = this.textures.exists('card-cost-energy')
      ? this.add.image(
        x + cardWidth / 2 - 28,
        y - cardHeight / 2 + 30,
        'card-cost-energy',
      ).setDisplaySize(costBadgeSize, costBadgeSize)
      : this.add.circle(
        x + cardWidth / 2 - 28,
        y - cardHeight / 2 + 30,
        compactLayout ? 11 : 12,
        0x0f172a,
        0.92,
      ).setStrokeStyle(2, 0x1f2937, 0.75)

    const emberGem = hasEmberCost
      ? (this.textures.exists('card-cost-ember')
        ? this.add.image(
          energyGem.x,
          energyGem.y + (compactLayout ? 26 : 28),
          'card-cost-ember',
        ).setDisplaySize(costBadgeSize, costBadgeSize)
        : this.add.circle(
          energyGem.x,
          energyGem.y + (compactLayout ? 26 : 28),
          compactLayout ? 11 : 12,
          0x7c2d12,
          0.95,
        ).setStrokeStyle(2, 0xfb923c, 0.88))
      : null

    const cost = this.add.text(energyGem.x, energyGem.y, `${energyCost}`, {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const emberCostText = emberGem
      ? this.add.text(emberGem.x, emberGem.y, `${emberCost}`, {
        fontSize: compactLayout ? '12px' : '13px',
        color: '#111827',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      : null

    const rarity = this.add.text(x, y + cardHeight / 2 - (compactLayout ? 20 : 22), `Type: ${frameType.toUpperCase()}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const cardObjects = [card, ...visuals, ...postFrameVisuals, energyGem, cost, titlePlate, title, bodyPlate, description, rarity]
    if (emberGem) {
      cardObjects.push(emberGem)
    }
    if (emberCostText) {
      cardObjects.push(emberCostText)
    }

    card.on('pointerover', () => {
      cardObjects.forEach((obj) => {
        const target = obj as Phaser.GameObjects.GameObject & { scaleX: number, scaleY: number, setScale: (x: number, y?: number) => void }
        target.setScale(target.scaleX * 1.015, target.scaleY * 1.015)
      })
    })

    card.on('pointerout', () => {
      cardObjects.forEach((obj) => {
        const target = obj as Phaser.GameObjects.GameObject & { setScale: (x: number, y?: number) => void }
        target.setScale(1, 1)
      })
    })

    card.on('pointerdown', () => {
      cardObjects.forEach((obj) => {
        const target = obj as Phaser.GameObjects.GameObject & { setScale: (x: number, y?: number) => void }
        target.setScale(0.97, 0.97)
      })
      this.tweens.add({
        targets: cardObjects,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      onClick()
    })
  }

  private getCardFrameType(card: CardContent): 'attack' | 'defense' | 'utility' {
    return getCardType(card)
  }

  private getCardArtBackgroundKey(card: CardContent): string | null {
    const baseId = getCardBaseId(card.id)
    const artKey = `card-art-bg-${baseId}`
    return this.textures.exists(artKey) ? artKey : null
  }

  private getCardArtKey(card: CardContent): string | null {
    const baseId = getCardBaseId(card.id)
    const foregroundArtKey = `card-art-fg-${baseId}`
    if (this.textures.exists(foregroundArtKey)) {
      return foregroundArtKey
    }

    const fallbackArtKey = `card-art-${baseId}`
    return this.textures.exists(fallbackArtKey) ? fallbackArtKey : null
  }

  private selectReward(card: CardContent) {
    if (this.rewardChosen) {
      return
    }

    this.rewardChosen = true

    try {
      addCardToRunDeck(card)
      if (this.mode === 'shard-forge') {
        consumeForgeAvailabilityForShardReward()
      }

      if (this.advanceFloorOnSelect) {
        advanceFloorAfterEncounter()
      }
      saveRun()
      this.scene.start(this.nextScene)
    } catch {
      this.rewardChosen = false
    }
  }

  private getRewardChoices(): CardContent[] {
    if (this.mode === 'boss-signature') {
      if (this.signatureCardId) {
        const signatureCard = getCardById(this.signatureCardId)
        if (signatureCard) {
          return [signatureCard]
        }
      }

      return generateRewardChoices('boss').slice(0, 1)
    }

    if (this.mode === 'shard-forge') {
      return generateRewardChoices('boss')
    }

    return generateRewardChoices(this.encounterType)
  }
}
