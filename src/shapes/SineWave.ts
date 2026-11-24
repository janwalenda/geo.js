import { FunctionGraph } from './FunctionGraph';
import type { SineWaveOptions } from './types';

/** Sine wave starting at its position and running along +x. */
export class SineWave extends FunctionGraph {
  constructor(options: SineWaveOptions = {}) {
    const amplitude = options.amplitude ?? 20;
    const wavelength = options.wavelength ?? 100;
    const phase = options.phase ?? 0;
    const length = options.length ?? wavelength;
    const resolution = options.resolution ?? 48;
    super({
      ...options,
      fn: (x) => amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase),
      xMin: 0,
      xMax: length,
      unit: 1,
      samples: Math.max(2, Math.ceil((length / wavelength) * resolution) + 1),
    });
  }
}
