import { PokiPlugin } from '@poki/phaser-3'
import { CharacterSelectScene } from './scenes/CharacterSelectScene'
import { DomainSelectScene } from './scenes/DomainSelectScene'
import { LoadingScene } from './scenes/LoadingScene'
import { LevelUpScene } from './scenes/LevelUpScene'
import { MapScene } from './scenes/MapScene'
import { MenuScene } from './scenes/MenuScene'
import { PlayScene } from './scenes/PlayScene'
import { RelicRewardScene } from './scenes/RelicRewardScene'
import { RewardScene } from './scenes/RewardScene'
import { RunEndScene } from './scenes/RunEndScene'
import { AUTO, Game, Scale, Types } from 'phaser'

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0f172a',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [LoadingScene, MenuScene, CharacterSelectScene, DomainSelectScene, MapScene, PlayScene, LevelUpScene, RewardScene, RelicRewardScene, RunEndScene],
  plugins: {
    global: [
      {
        plugin: PokiPlugin,
        key: 'poki',
        start: true,
        data: {
          loadingSceneKey: 'LoadingScene',
          gameplaySceneKey: 'PlayScene',
          autoCommercialBreak: true,
        },
      },
    ],
  },
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

export default StartGame