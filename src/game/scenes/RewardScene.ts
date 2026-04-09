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
  { key: 'card-rarity-overlay-common', path: 'assets/cards/rarity-overlay-common.png' },
  { key: 'card-rarity-overlay-uncommon', path: 'assets/cards/rarity-overlay-uncommon.png' },
  { key: 'card-rarity-overlay-rare', path: 'assets/cards/rarity-overlay-rare.png' },
  { key: 'card-rarity-gems-uncommon', path: 'assets/cards/rarity-gems-uncommon.png' },
  { key: 'card-rarity-gems-rare', path: 'assets/cards/rarity-gems-rare.png' },
  { key: 'card-art-unicorn-strike', path: 'assets/cards/art-unicorn-strike.png' },
  { key: 'card-art-golden-shield', path: 'assets/cards/art-golden-shield.png' },
  { key: 'card-art-charge', path: 'assets/cards/art-charge.png' },
  { key: 'card-art-crown-diamonds', path: 'assets/cards/art-crown-diamonds.png' },
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
    const artKey = this.getCardArtKey(cardData)

    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xffffff, 0.001)
      .setStrokeStyle(0, 0x000000, 0)
      .setInteractive({ useHandCursor: true })

    const visuals: Phaser.GameObjects.GameObject[] = []
    const postFrameVisuals: Phaser.GameObjects.GameObject[] = []

    if (this.textures.exists(overlayKey)) {
      visuals.push(this.add.image(x, y, overlayKey).setDisplaySize(cardWidth, cardHeight))
    }

    if (this.textures.exists(frameKey)) {
      visuals.push(this.add.image(x, y, frameKey).setDisplaySize(cardWidth, cardHeight))
    }

    const artWindow = this.add.rectangle(
      x,
      y - (compactLayout ? 18 : 20),
      cardWidth - 28,
      compactLayout ? 72 : 78,
      0x0f172a,
      0.16,
    ).setStrokeStyle(1, 0x0f172a, 0.34)
    postFrameVisuals.push(artWindow)

    if (artKey && this.textures.exists(artKey)) {
      const artImage = this.add.image(x, artWindow.y, artKey)
      const source = this.textures.get(artKey).getSourceImage() as { width: number, height: number }
      const maxW = cardWidth - 32
      const maxH = compactLayout ? 66 : 72
      const scale = Math.min(maxW / source.width, maxH / source.height)
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

    const cost = this.add.text(x, y + (compactLayout ? 88 : 94), `Cost: ${cardData.cost}`, {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const rarity = this.add.text(x, y + cardHeight / 2 - (compactLayout ? 20 : 22), `Type: ${frameType.toUpperCase()}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const cardObjects = [card, ...visuals, ...postFrameVisuals, titlePlate, title, bodyPlate, description, cost, rarity]

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

  private getCardArtKey(card: CardContent): string | null {
    const baseId = getCardBaseId(card.id)
    const artKey = `card-art-${baseId}`
    return this.textures.exists(artKey) ? artKey : null
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
