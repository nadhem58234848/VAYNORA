// Short sound effects only (no music): tap, hit, enemy down, flame, win.
import { createAudioPlayer } from 'expo-audio';

const SRC = {
  tap: require('../assets/sfx/tap.wav'),
  hit: require('../assets/sfx/hit.wav'),
  down: require('../assets/sfx/down.wav'),
  flame: require('../assets/sfx/flame.wav'),
  win: require('../assets/sfx/win.wav'),
};
const players = {};
let on = true;
export const setSound = (v) => { on = v !== false; };
export function sfx(name) {
  if (!on) return;
  try {
    if (!players[name]) players[name] = createAudioPlayer(SRC[name]);
    const p = players[name];
    p.seekTo(0);
    p.play();
  } catch {}
}
