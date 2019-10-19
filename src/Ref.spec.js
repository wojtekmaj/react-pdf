import Ref from './Ref';

describe('Ref', () => {
  it('returns proper reference for given num and gen', () => {
    const num = 1;
    const gen = 2;
    const ref = new Ref({ num, gen });
    expect(ref.toString()).toBe('1R2');
  });

  it('returns proper reference for given num and gen when gen = 0', () => {
    const num = 1;
    const gen = 0;
    const ref = new Ref({ num, gen });
    expect(ref.toString()).toBe('1R');
  });
});
