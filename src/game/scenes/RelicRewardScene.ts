import Phaser from 'phaser'
import { addRelicToRun, advanceFloorAfterEncounter } from '../battle/runState'
import { saveRun } from '../battle/runSave'
import { RELIC_POOL, type RelicContent } from '../content/relics'

type RelicRewardSceneData = {
  nextScene?: 'MapScene' | 'RunEndScene'
}

export class RelicRewardScene extends Phaser.Scene {
  private rewardChosen = false
  private nextScene: 'MapScene' | 'RunEndScene' = 'MapScene'

  constructor() {
    super('RelicRewardScene')
  }

  create(data: RelicRewardSceneData = {}) {
    const { width, height } = this.scale
    const compactLayout = width < 980 || height < 720
    this.rewardChosen = false
    this.nextScene = data.nextScene ?? 'MapScene'

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 40, 'Relic Reward', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, 'Choose 1 relic', {
      fontSize: '18px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 112, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.removeAllListeners('keydown-ESC')
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const rewards = this.getRelicChoices(3)
    const spacing = compactLayout ? 220 : 300
    const startX = width / 2 - ((rewards.length - 1) * spacing) / 2

    rewards.forEach((relic, index) => {
      const x = startX + index * spacing
      this.createRelicCard(x, height / 2 + 40, compactLayout, relic, () => {
        this.selectRelic(relic)
      })
    })
  }

  private createRelicCard(x: number, y: number, compactLayout: boolean, relic: RelicContent, onClick: () => void) {
    const cardWidth = compactLayout ? 186 : 220
    const cardHeight = compactLayout ? 212 : 220
    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)
      .setInteractive({ useHandCursor: true })

    this.add.text(x, y - 70, relic.name, {
      fontSize: compactLayout ? '19px' : '22px',
      color: '#111827',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: cardWidth - 28 },
    }).setOrigin(0.5)

    this.add.text(x, y + 10, relic.description, {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#374151',
      align: 'center',
      wordWrap: { width: cardWidth - 28 },
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

  private selectRelic(relic: RelicContent) {
    if (this.rewardChosen) {
      return
    }

    this.rewardChosen = true
    addRelicToRun(relic)
    advanceFloorAfterEncounter()
    saveRun()
    this.scene.start(this.nextScene)
  }

  private getRelicChoices(count: number): RelicContent[] {
    const shuffled = [...RELIC_POOL]

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled.slice(0, count).map((relic) => ({ ...relic }))
  }
}
