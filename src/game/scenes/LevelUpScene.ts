import Phaser from 'phaser'
import { getAbilityChoicesForRun, type HeroAbilityContent } from '../content/abilities'
import { createUpgradedCard } from '../content/cards'
import {
  applyLevelUpRecoveryChoice,
  addAbilityToRun,
  consumePendingLevelUp,
  getRunAbilities,
  getRunDeck,
  getRunState,
  getXpForNextLevel,
  hasPendingLevelUp,
  upgradeRunCard,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'

type LevelUpRewardType = 'upgrade-card' | 'gain-passive' | 'stabilize'

type LevelUpOption = {
  type: LevelUpRewardType
  title: string
  description: string
  x: number
  y: number
  width: number
  onSelect: () => void
}

type LevelUpSceneData = {
  nextScene?: 'RewardScene' | 'RelicRewardScene' | 'MapScene' | 'RunEndScene'
  nextData?: Record<string, unknown>
}

export class LevelUpScene extends Phaser.Scene {
  private nextScene: LevelUpSceneData['nextScene'] = 'MapScene'
  private nextData: Record<string, unknown> = {}
  private optionObjects: Phaser.GameObjects.GameObject[] = []
  private choiceLocked = false

  constructor() {
    super('LevelUpScene')
  }

  create(data: LevelUpSceneData = {}) {
    this.nextScene = data.nextScene ?? 'MapScene'
    this.nextData = data.nextData ?? {}
    this.choiceLocked = false
    this.clearOptionObjects()

    if (!hasPendingLevelUp()) {
      this.continueToNextScene()
      return
    }

    const { width, height } = this.scale
    const compactLayout = width < 960 || height < 720
    const state = getRunState()
    const nextLevelXp = getXpForNextLevel()

    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(width / 2, 42, 'Level Up', {
      fontSize: compactLayout ? '34px' : '38px',
      color: '#fef3c7',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const xpLabel = nextLevelXp === null
      ? 'Max level reached this run'
      : `XP: ${state.heroXp} | Next: ${nextLevelXp}`

    this.add.text(width / 2, 84, `Level ${state.heroLevel}  |  ${xpLabel}`, {
      fontSize: compactLayout ? '16px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.add.text(width / 2, 114, 'Choose your growth', {
      fontSize: compactLayout ? '17px' : '18px',
      color: '#e2e8f0',
    }).setOrigin(0.5)

    this.input.keyboard?.removeAllListeners('keydown-ESC')
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const options = this.getLevelUpOptions(compactLayout)
    options.forEach((option) => {
      this.createActionButton(
        option.x,
        option.y,
        option.width,
        option.title,
        option.description,
        option.onSelect,
      )
    })
  }

  private showCardUpgradeChoices() {
    if (this.choiceLocked) {
      return
    }

    this.clearOptionObjects()

    const { width, height } = this.scale
    const compactLayout = width < 960 || height < 720
    const deck = getRunDeck()

    this.addOptionText(width / 2, compactLayout ? 370 : 280, 'Choose a card to upgrade')

    if (deck.length === 0) {
      this.addOptionText(width / 2, compactLayout ? 404 : 318, 'No cards available')
      return
    }

    const columnCount = compactLayout ? 1 : 2
    const rowHeight = compactLayout ? 40 : 36
    const buttonWidth = compactLayout ? 520 : 560
    const startY = compactLayout ? 430 : 330
    const leftX = width / 2 - 290
    const rightX = width / 2 + 290

    deck.forEach((card, index) => {
      const row = Math.floor(index / columnCount)
      const col = index % columnCount
      const x = col === 0 ? leftX : rightX
      const y = startY + row * rowHeight

      const upgraded = createUpgradedCard(card)
      const label = `${card.title} -> ${upgraded.title} | Cost ${card.cost}->${upgraded.cost} | Value ${card.value}->${upgraded.value}`

      const button = this.add.rectangle(x, y, buttonWidth, compactLayout ? 30 : 28, 0x1e293b)
        .setStrokeStyle(1, 0x64748b)
        .setInteractive({ useHandCursor: true })

      const text = this.add.text(x - buttonWidth / 2 + 8, y, label, {
        fontSize: compactLayout ? '13px' : '12px',
        color: '#e2e8f0',
        align: 'left',
      }).setOrigin(0, 0.5)

      button.on('pointerover', () => {
        button.setStrokeStyle(1, 0xf59e0b)
      })

      button.on('pointerout', () => {
        button.setStrokeStyle(1, 0x64748b)
      })

      button.on('pointerdown', () => {
        if (this.choiceLocked) {
          return
        }

        this.choiceLocked = true
        upgradeRunCard(card.id)
        this.finishLevelUp(`Upgraded ${card.title}`)
      })

      this.optionObjects.push(button, text)
    })
  }

  private showAbilityChoices() {
    if (this.choiceLocked) {
      return
    }

    this.clearOptionObjects()

    const { width } = this.scale
    const choices = getAbilityChoicesForRun(getRunAbilities(), 3)

    this.addOptionText(width / 2, 280, 'Choose a passive ability')

    if (choices.length === 0) {
      this.addOptionText(width / 2, 322, 'All blessings are already learned. Pick a card upgrade instead.')
      this.showCardUpgradeChoices()
      return
    }

    choices.forEach((ability, index) => {
      this.createAbilityButton(width / 2, 360 + index * 120, ability)
    })
  }

  private createAbilityButton(x: number, y: number, ability: HeroAbilityContent) {
    const box = this.add.rectangle(x, y, 560, 96, 0x1e293b)
      .setStrokeStyle(2, 0x64748b)
      .setInteractive({ useHandCursor: true })

    const name = this.add.text(x, y - 22, ability.name, {
      fontSize: '24px',
      color: '#fde68a',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const description = this.add.text(x, y + 14, ability.description, {
      fontSize: '16px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5)

    box.on('pointerover', () => {
      box.setStrokeStyle(2, 0xf59e0b)
    })

    box.on('pointerout', () => {
      box.setStrokeStyle(2, 0x64748b)
    })

    box.on('pointerdown', () => {
      if (this.choiceLocked) {
        return
      }

      this.choiceLocked = true
      addAbilityToRun(ability)
      this.finishLevelUp(`Passive gained: ${ability.name}`)
    })

    this.optionObjects.push(box, name, description)
  }

  private createActionButton(
    x: number,
    y: number,
    width: number,
    title: string,
    description: string,
    onClick: () => void,
  ) {
    const card = this.add.rectangle(x, y, width, 96, 0x1e293b)
      .setStrokeStyle(2, 0x64748b)
      .setInteractive({ useHandCursor: true })

    const titleText = this.add.text(x, y - 18, title, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const descriptionText = this.add.text(x, y + 16, description, {
      fontSize: '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: width - 26 },
    }).setOrigin(0.5)

    card.on('pointerover', () => {
      card.setStrokeStyle(2, 0xf59e0b)
    })

    card.on('pointerout', () => {
      card.setStrokeStyle(2, 0x64748b)
    })

    card.on('pointerdown', () => {
      if (this.choiceLocked) {
        return
      }

      onClick()
    })

    this.optionObjects.push(card, titleText, descriptionText)
  }

  private addOptionText(x: number, y: number, text: string) {
    const optionText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5)

    this.optionObjects.push(optionText)
  }

  private chooseStabilityGrowth() {
    if (this.choiceLocked) {
      return
    }

    this.choiceLocked = true
    const result = applyLevelUpRecoveryChoice(3, 7)
    this.finishLevelUp(`Fortified: Max HP ${result.maxHeroHp}, HP ${result.heroHp}`)
  }

  private getLevelUpOptions(compactLayout: boolean): LevelUpOption[] {
    const { width } = this.scale

    if (compactLayout) {
      return [
        {
          type: 'upgrade-card',
          title: 'Upgrade a Card',
          description: 'Improve 1 card in your deck.',
          x: width / 2,
          y: 174,
          width: 360,
          onSelect: () => this.showCardUpgradeChoices(),
        },
        {
          type: 'gain-passive',
          title: 'Gain a Passive',
          description: 'Choose a small run-long hero passive.',
          x: width / 2,
          y: 282,
          width: 360,
          onSelect: () => this.showAbilityChoices(),
        },
        {
          type: 'stabilize',
          title: 'Stabilize',
          description: '+3 Max HP and heal 7 HP.',
          x: width / 2,
          y: 390,
          width: 360,
          onSelect: () => this.chooseStabilityGrowth(),
        },
      ]
    }

    return [
      {
        type: 'upgrade-card',
        title: 'Upgrade a Card',
        description: 'Improve 1 card in your deck.',
        x: width / 2 - 228,
        y: 188,
        width: 300,
        onSelect: () => this.showCardUpgradeChoices(),
      },
      {
        type: 'gain-passive',
        title: 'Gain a Passive',
        description: 'Choose a small run-long hero passive.',
        x: width / 2,
        y: 188,
        width: 300,
        onSelect: () => this.showAbilityChoices(),
      },
      {
        type: 'stabilize',
        title: 'Stabilize',
        description: '+3 Max HP and heal 7 HP.',
        x: width / 2 + 228,
        y: 188,
        width: 300,
        onSelect: () => this.chooseStabilityGrowth(),
      },
    ]
  }

  private finishLevelUp(message: string) {
    const { width } = this.scale
    this.add.text(width / 2, 210, message, {
      fontSize: '22px',
      color: '#86efac',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    consumePendingLevelUp()
    saveRun()

    this.time.delayedCall(240, () => {
      if (hasPendingLevelUp()) {
        this.scene.restart({
          nextScene: this.nextScene,
          nextData: this.nextData,
        })
        return
      }

      this.continueToNextScene()
    })
  }

  private continueToNextScene() {
    saveRun()
    this.scene.start(this.nextScene ?? 'MapScene', this.nextData)
  }

  private clearOptionObjects() {
    if (this.optionObjects.length === 0) {
      return
    }

    this.optionObjects.forEach((obj) => {
      obj.destroy()
    })

    this.optionObjects = []
  }
}
