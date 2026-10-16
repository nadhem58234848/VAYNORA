import {Composition} from 'remotion';
import {Reel} from './Reel';
import {FPS} from './theme';
import reel from './reel.json';
export const RemotionRoot = () => (
  <Composition id="Reel" component={Reel} durationInFrames={Math.round((reel as any).duration*FPS)}
    fps={FPS} width={1080} height={1920}/>
);
