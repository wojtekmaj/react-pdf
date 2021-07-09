import Singleton from './Singleton';

describe('Singleton', () => {
  it('should create instance only on first acquire call', () => {
    const create = jest.fn();
    const singleton = new Singleton(create, () => {});

    singleton.acquire();
    singleton.acquire();

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('should destroy instance when nobody uses it', () => {
    const destroy = jest.fn();
    const singleton = new Singleton(() => {}, destroy);

    singleton.acquire();
    singleton.acquire();
    singleton.release();
    singleton.release();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('returns one instance for all acquire calls', () => {
    const instance = {};
    const singleton = new Singleton(() => instance, () => {});

    const first = singleton.acquire();
    const second = singleton.acquire();

    expect(first).toEqual(second);
  });
});
