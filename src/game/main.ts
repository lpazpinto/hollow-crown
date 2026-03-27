import { PokiPlugin } from '@poki/phaser-3'
import { LoadingScene } from './scenes/LoadingScene'
import { MenuScene } from './scenes/MenuScene'
import { PlayScene } from './scenes/PlayScene'
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
  scene: [LoadingScene, MenuScene, PlayScene],
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