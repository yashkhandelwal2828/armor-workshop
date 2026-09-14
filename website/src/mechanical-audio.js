// Original procedural sound design. No film samples or microphone access.
export function createMechanicalAudio() {
  let context,
    master,
    motor,
    motorGain,
    pan,
    analyser,
    gear,
    gearGain,
    chatter,
    chatterGain,
    enabled = true,
    events = 0;
  function initialize() {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = enabled ? 0.28 : 0;
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      master.connect(analyser);
      analyser.connect(context.destination);
      pan = context.createStereoPanner();
      pan.connect(master);
      motor = context.createOscillator();
      motor.type = "sawtooth";
      motorGain = context.createGain();
      motorGain.gain.value = 0;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 650;
      motor.connect(filter);
      filter.connect(motorGain);
      motorGain.connect(pan);
      motor.start();
      gear = context.createOscillator();
      gear.type = "triangle";
      gearGain = context.createGain();
      gearGain.gain.value = 0;
      gear.connect(gearGain);
      gearGain.connect(pan);
      gear.start();
      chatter = context.createOscillator();
      chatter.type = "square";
      chatterGain = context.createGain();
      chatterGain.gain.value = 0.025;
      chatter.connect(chatterGain);
      chatterGain.connect(motorGain.gain);
      chatter.start();
    }
    context.resume().catch(() => {});
  }
  function init() {
    try {
      initialize();
    } catch {
      // Audio is optional; graphics and installation must still work.
      context?.close().catch(() => {});
      context =
        master =
        motor =
        motorGain =
        pan =
        analyser =
        gear =
        gearGain =
        chatter =
        chatterGain =
          undefined;
    }
  }
  function tone(freq, duration, volume) {
    if (!context) return;
    const osc = context.createOscillator(),
      gain = context.createGain(),
      now = context.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(now + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  function cue(kind) {
    if (!context) return;
    events++;
    const duration = kind === "Lock" ? 0.25 : 0.13,
      now = context.currentTime;
    const buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * duration),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / data.length) * 7);
    const source = context.createBufferSource(),
      filter = context.createBiquadFilter(),
      gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = kind === "Release" ? 1700 : 800;
    filter.Q.value = 0.7;
    gain.gain.value = 0.3;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    tone(kind === "Lock" ? 180 : kind === "Scan" ? 920 : 310, duration, 0.25);
  }
  return {
    init,
    cue,
    set enabled(value) {
      enabled = value;
      if (master)
        master.gain.setTargetAtTime(
          value ? 0.28 : 0,
          context.currentTime,
          0.05,
        );
    },
    get state() {
      let peak = 0;
      if (analyser) {
        const samples = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(samples);
        peak = Math.max(...samples.map(Math.abs));
      }
      return {
        enabled,
        context: context?.state || "uninitialized",
        events,
        peak,
      };
    },
    drive(speed, x) {
      if (!context) return;
      gear.frequency.setTargetAtTime(
        360 + speed * 1300,
        context.currentTime,
        0.1,
      );
      gearGain.gain.setTargetAtTime(
        Math.min(0.055, speed * 0.075),
        context.currentTime,
        0.05,
      );
      chatter.frequency.setTargetAtTime(
        22 + speed * 65,
        context.currentTime,
        0.08,
      );
      chatterGain.gain.setTargetAtTime(
        speed > 0.015 ? 0.013 : 0,
        context.currentTime,
        0.04,
      );
      motor.frequency.setTargetAtTime(
        85 + speed * 250,
        context.currentTime,
        0.07,
      );
      motorGain.gain.setTargetAtTime(
        Math.min(0.13, speed * 0.18),
        context.currentTime,
        0.07,
      );
      pan.pan.setTargetAtTime(
        Math.max(-0.8, Math.min(0.8, x)),
        context.currentTime,
        0.1,
      );
    },
    stop() {
      if (context) {
        motorGain.gain.setTargetAtTime(0, context.currentTime, 0.03);
        gearGain.gain.setTargetAtTime(0, context.currentTime, 0.03);
        chatterGain.gain.setTargetAtTime(0, context.currentTime, 0.03);
      }
    },
  };
}
