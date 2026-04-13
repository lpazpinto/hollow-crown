import Phaser from 'phaser'

type Character = {
  id: string
  name: string
  description: string
}

const AVAILABLE_CHARACTERS: Character[] = [
  {
    id: 'unicorn-hero',
    name: 'Unicorn Knight',
    description: 'A magical warrior blessed by ancient horns. Draws power from friendship and determination.',
  },
  // Future characters will be added here as they become available
  // { id: 'char-2', name: 'Character 2', description: '...' },
  // { id: 'char-3', name: 'Character 3', description: '...' },
]

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700

    this.cameras.main.setBackgroundColor('#1e293b')

    // Title
    this.add.text(width / 2, compactLayout ? 60 : 70, 'Select Your Hero', {
      fontSize: compactLayout ? '32px' : '38px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, compactLayout ? 100 : 115, 'Choose a character to begin your journey', {
      fontSize: compactLayout ? '14px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    // Character selection buttons
    const buttonSpacing = compactLayout ? 180 : 220
    const startX = width / 2 - ((AVAILABLE_CHARACTERS.length - 1) * buttonSpacing) / 2

    AVAILABLE_CHARACTERS.forEach((character, index) => {
      const x = startX + index * buttonSpacing
      const y = compactLayout ? height / 2 + 40 : height / 2 + 60

      // Character button
      const button = this.add.rectangle(x, y, compactLayout ? 140 : 160, compactLayout ? 140 : 160, 0x1e293b)
        .setStrokeStyle(2, 0xffd166)
        .setInteractive({ useHandCursor: true })

      // Character name
      this.add.text(x, y - 40, character.name, {
        fontSize: compactLayout ? '16px' : '18px',
        color: '#ffd166',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      // Character description
      this.add.text(x, y + 20, character.description, {
        fontSize: compactLayout ? '11px' : '12px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: compactLayout ? 120 : 140 },
      }).setOrigin(0.5)

      // Click handler
      button.on('pointerdown', () => {
        this.selectCharacter(character.id)
      })

      // Hover effect
      button.on('pointerover', () => {
        button.setFillStyle(0x0f172a, 0.8)
      })

      button.on('pointerout', () => {
        button.setFillStyle(0x1e293b)
      })
    })

    // Footer text
    if (AVAILABLE_CHARACTERS.length < 6) {
      this.add.text(width / 2, height - 60, `${AVAILABLE_CHARACTERS.length} / 6 characters available`, {
        fontSize: compactLayout ? '12px' : '14px',
        color: '#64748b',
        align: 'center',
      }).setOrigin(0.5)
    }
  }

  private selectCharacter(characterId: string) {
    // In the future, this can store the selected character for cosmetics,
    // dialogue, or character-specific mechanics.
    // For now, it just proceeds to domain selection.
    this.scene.start('DomainSelectScene')
  }
}
