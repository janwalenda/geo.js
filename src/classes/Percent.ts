export class Percent {
    public max:     number;
    public value:   number;
    public percent: number;
    constructor(options: { max?: number; value?: number; percent?: number }) {
      this.max = (options.max || (options.value! * 100) / options.percent!);
      this.value = (options.value || (options.percent! * options.max!) / 100);
      this.percent = (options.percent || options.value! / options.max! * 100);
    }
    get percentString(): string {
      return `${this.percent}%`;
    }
  }
  