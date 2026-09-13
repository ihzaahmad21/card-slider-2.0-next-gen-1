const base = import.meta.env.BASE_URL || '/';

export const AUDIO_TRACKS = [
  {
    id: 'title-theme',
    name: 'Title Theme of STORM 4',
    file: `${base}audio/storm4-title-theme.mp3`,
    duration: 180,
    mood: 'epic'
  },
  {
    id: 'story-board',
    name: 'Story Board Creation',
    file: `${base}audio/storm4-story-board.mp3`,
    duration: 156,
    mood: 'calm'
  },
  {
    id: 'character-select',
    name: 'Character / Stage Select',
    file: `${base}audio/storm4-character-select.mp3`,
    duration: 140,
    mood: 'action'
  }
];

export const DEFAULT_TRACK = AUDIO_TRACKS[0].id;
export const DEFAULT_VOLUME = 0.5;