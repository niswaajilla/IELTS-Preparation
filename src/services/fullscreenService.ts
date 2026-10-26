export const fullscreenService = {
  // Check if browser currently in fullscreen
  isFullscreen(): boolean {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  },

  // Request fullscreen on an element (or document.documentElement)
  async enterFullscreen(element?: HTMLElement): Promise<boolean> {
    if (typeof document === 'undefined') return false;
    const target = element || document.documentElement;

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
        return true;
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
        return true;
      } else if ((target as any).mozRequestFullScreen) {
        await (target as any).mozRequestFullScreen();
        return true;
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen();
        return true;
      }
    } catch (err) {
      console.warn('Native fullscreen request was blocked or not permitted (e.g. iframe policy):', err);
    }
    return false;
  },

  // Exit fullscreen
  async exitFullscreen(): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    try {
      if (this.isFullscreen()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          return true;
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
          return true;
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
          return true;
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
          return true;
        }
      }
    } catch (err) {
      console.warn('Native exit fullscreen error:', err);
    }
    return false;
  },

  // Toggle fullscreen helper
  async toggleFullscreen(element?: HTMLElement): Promise<boolean> {
    if (this.isFullscreen()) {
      await this.exitFullscreen();
      return false;
    } else {
      const success = await this.enterFullscreen(element);
      return success;
    }
  },

  // Listen to fullscreen changes
  onChange(callback: (isFull: boolean) => void): () => void {
    if (typeof document === 'undefined') return () => {};

    const handler = () => {
      callback(this.isFullscreen());
    };

    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);
    document.addEventListener('MSFullscreenChange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
      document.removeEventListener('MSFullscreenChange', handler);
    };
  }
};
