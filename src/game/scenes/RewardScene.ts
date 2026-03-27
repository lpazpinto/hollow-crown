import Phaser from 'phaser'
import { addCardToRunDeck, advanceFloorAfterEncounter } from '../battle/runState'
import { saveRun } from '../battle/runSave'
import { REWARD_CARD_OPTIONS, type CardContent } from '../content/cards'

export class RewardScene extends Phaser.Scene {
  private rewardChosen = false

  constructor() {
    super('RewardScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    this.rewardChosen = false

    console.log('[RewardScene] create')

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 40, 'Victory Reward', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, 'Choose 1 card to add to your deck', {
      fontSize: '18px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 112, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.removeAllListeners('keydown-ESC')
    this.input.keyboard?.on('keydown-ESC', () => {
      console.log('[RewardScene] ESC -> MenuScene')
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
    } catch (error) {
      console.error('[RewardScene] create failed', error)
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
      console.log('[RewardScene] reward clicked', cardData.title)
      onClick()
    })
  }

  private selectReward(card: CardContent) {
    if (this.rewardChosen) {
      return
    }

    this.rewardChosen = true

    try {
      console.log('[RewardScene] selectReward', card.title)
      addCardToRunDeck(card)
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.start('MapScene')
    } catch (error) {
      this.rewardChosen = false
      console.error('[RewardScene] selectReward failed', error)
    }
  }

  private getRewardChoices(): CardContent[] {
    const shuffled = [...REWARD_CARD_OPTIONS]

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled.slice(0, 3).map((card) => ({ ...card }))
  }
}
