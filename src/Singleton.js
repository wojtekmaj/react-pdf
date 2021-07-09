class Singleton {
  constructor(create, destroy) {
    this.create = create;
    this.destroy = destroy;

    this.usageCount = 0;
  }

  acquire() {
    if (!this.usageCount) {
      this.instance = this.create();
    }

    this.usageCount += 1;

    return this.instance;
  }

  release() {
    this.usageCount -= 1;

    if (this.usageCount <= 0) {
      this.destroy(this.instance);
      this.usageCount = 0;
    }
  }
}

export default Singleton;
