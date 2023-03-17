export default class Ref {
  num: number;
  gen: number;

  constructor({ num, gen }: { num: number; gen: number }) {
    this.num = num;
    this.gen = gen;
  }

  toString() {
    let str = `${this.num}R`;
    if (this.gen !== 0) {
      str += this.gen;
    }
    return str;
  }
}
