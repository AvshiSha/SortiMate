# Sound Effects

## Adding the Coin Drop Sound

To add the coin drop sound effect:

1. **Download a coin drop sound** from one of these sources:
   - [Freesound.org](https://freesound.org/search/?q=coin+drop) - Search for "coin drop"
   - [Zapsplat.com](https://www.zapsplat.com/sound-effect-category/coins/) - Professional sound effects
   - [SoundBible.com](http://soundbible.com/tags-coin.html) - Simple, free sounds

2. **Rename the file** to `coin-drop.mp3`

3. **Place it in this folder** (`public/sounds/coin-drop.mp3`)

## Sound Requirements

- **Format**: MP3 (preferred) or WAV
- **Duration**: 0.5-2 seconds (short and satisfying)
- **Volume**: The app will automatically set volume to 30%
- **Quality**: 44.1kHz, 128kbps or higher

## Features

- ✅ **Safe implementation** - Won't crash the app if sound fails to load
- ✅ **Automatic volume control** - Set to 30% to avoid being too loud
- ✅ **Error handling** - Gracefully handles missing files or unsupported browsers
- ✅ **Silent fallback** - App continues working even if sound is unavailable

## Testing

The sound will play automatically when:
- A user adds a bottle to their recycling session
- Points are earned during recycling

If you don't hear the sound, check the browser console for any error messages.
