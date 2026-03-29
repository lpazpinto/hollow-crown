import Phaser from 'phaser'
import { addCardToRunDeck, advanceFloorAfterEncounter } from '../battle/runState'
import { saveRun } from '../battle/runSave'
import {
  generateRewardChoices,
  type CardContent,
  type RewardEncounterType,
} from '../content/cards'

type RewardSceneData = {
  encounterType?: RewardEncounterType
}

export class RewardScene extends Phaser.Scene {
  private rewardChosen = false
  private encounterType: RewardEncounterType = 'battle'

  constructor() {
    super('RewardScene')
  }

  create(data: RewardSceneData = {}) {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    this.rewardChosen = false
    this.encounterType = data.encounterType ?? 'battle'

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 40, 'Card Draft', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, 'Choose 1 card to deepen your run build', {
      fontSize: '18px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 100, `Reward Type: ${this.encounterType.toUpperCase()}`, {
      fontSize: '16px',
      color: '#93c5fd',
    }).setOrigin(0.5)

    this.add.text(width / 2, 122, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.removeAllListeners('keydown-ESC')
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    try {
      const rewards = this.getRewardChoices()
      const spacing = compactLayout ? 200 : 230
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
    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)
      .setInteractive({ useHandCursor: true })

    this.add.text(x, y - 70, cardData.title, {
      fontSize: compactLayout ? '21px' : '24px',
      color: '#111827',
      fontStyle: 'bold',
      wordWrap: { width: cardWidth - 24 },
      align: 'center',
    }).setOrigin(0.5)

    this.add.text(x, y, cardData.description, {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#374151',
      align: 'center',
      wordWrap: { width: cardWidth - 36 },
    }).setOrigin(0.5)

    this.add.text(x, y + 76, `Cost: ${cardData.cost}`, {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y + 98, `Rarity: ${cardData.rarity.toUpperCase()}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#334155',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    card.on('pointerover', () => {
      card.setStrokeStyle(3, 0xf59e0b)
    })

    card.on('pointerout', () => {
      card.setStrokeStyle(3, 0x1f2937)
    })

    card.on('pointerdown', () => {
      card.setScale(0.97)
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      onClick()
    })
  }

  private selectReward(card: CardContent) {
    if (this.rewardChosen) {
      return
    }

    this.rewardChosen = true

    try {
      addCardToRunDeck(card)
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.start('MapScene')
    } catch {
      this.rewardChosen = false
    }
  }

  private getRewardChoices(): CardContent[] {
    return generateRewardChoices(this.encounterType)
  }
}
