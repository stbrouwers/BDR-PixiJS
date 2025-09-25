export class audioManager {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startTime: number = 0;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadAudio(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play(gain: number, offset?: number) {
    if (!this.buffer) throw new Error("No audio buffer loaded");
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);

    this.gainNode.gain.value = gain;

    this.source.start(0, offset ?? 0);
    this.startTime = this.audioContext.currentTime;
  }

  getPosition(): number {
    if (!this.source) return 0;
    return this.audioContext.currentTime - this.startTime;
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume;
  }
}
