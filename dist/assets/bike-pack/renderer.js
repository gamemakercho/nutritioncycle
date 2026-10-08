(function (root) {
  'use strict';
  class FoodBikeRenderer {
    constructor(manifest, images) {
      this.manifest = manifest;
      this.images = images;
      this.reset();
    }
    static async load(manifest, base = '.') {
      const pairs = await Promise.all(Object.entries(manifest.assets).map(async ([name, path]) => {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('이미지 로딩 실패: ' + path));
        });
        img.src = base.replace(/\/$/, '') + '/' + path;
        await promise;
        if (img.decode) await img.decode();
        return [name, img];
      }));
      return new FoodBikeRenderer(manifest, Object.fromEntries(pairs));
    }
    static transformFor(frame, world) {
      const sx = frame.frontAxle[0] - frame.rearAxle[0];
      const sy = frame.frontAxle[1] - frame.rearAxle[1];
      const tx = world.frontAxle[0] - world.rearAxle[0];
      const ty = world.frontAxle[1] - world.rearAxle[1];
      const scale = Math.hypot(tx, ty) / Math.hypot(sx, sy);
      const angle = Math.atan2(ty, tx) - Math.atan2(sy, sx);
      const a = Math.cos(angle) * scale;
      const b = Math.sin(angle) * scale;
      const c = -b;
      const d = a;
      return [a, b, c, d,
        world.rearAxle[0] - a * frame.rearAxle[0] - c * frame.rearAxle[1],
        world.rearAxle[1] - b * frame.rearAxle[0] - d * frame.rearAxle[1]];
    }
    reset() {
      this.speedKmh = 0;
      this.fast = false;
      this.distance = 0;
      this.pedalPhase = 0;
    }
    update(displayedSpeedKmh, dt, traveledPixels) {
      this.speedKmh = Math.max(0, Math.min(100, Math.round(displayedSpeedKmh)));
      if (this.speedKmh >= this.manifest.animation.fastEnterKmh) this.fast = true;
      if (this.speedKmh <= this.manifest.animation.fastExitKmh) this.fast = false;
      dt = Math.max(0, Math.min(dt, 0.1));
      this.distance += Number.isFinite(traveledPixels) ? traveledPixels : this.speedKmh * 10 * dt;
      if (this.speedKmh > 0) {
        const fps = this.fast
          ? 12 + (this.speedKmh - 70) * 0.13
          : 3 + this.speedKmh * 0.10;
        this.pedalPhase = (this.pedalPhase + fps * dt / 4) % 1;
      }
    }
    get frame() {
      const frames = this.fast ? this.manifest.animations.fast : this.manifest.animations.normal;
      return this.manifest.frames[frames[Math.floor(this.pedalPhase * 4) % 4]];
    }
    draw(ctx, x, y, scale = 1) {
      const m = this.manifest;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      for (const kind of ['rearWheel', 'frontWheel']) {
        const wheel = m.wheels[kind];
        ctx.save();
        ctx.translate(wheel.center[0], wheel.center[1]);
        ctx.rotate(this.distance / wheel.radius);
        const nativeScale = wheel.radius / wheel.nativeRadius;
        ctx.scale(nativeScale, nativeScale);
        ctx.drawImage(this.images[kind], -wheel.pivot[0], -wheel.pivot[1]);
        ctx.restore();
      }
      ctx.save();
      const frame = this.frame;
      ctx.transform(...FoodBikeRenderer.transformFor(frame, m.world));
      const r = frame.sourceRect;
      ctx.drawImage(this.images.riderFrame, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      ctx.restore();
      ctx.restore();
    }
  }
  root.FoodBikeRenderer = FoodBikeRenderer;
  if (typeof module !== 'undefined' && module.exports) module.exports = FoodBikeRenderer;
})(globalThis);
