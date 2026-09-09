class AssetLoader {
  constructor() {
    this.images = {}
  }

  load(path) {
    if (!path || typeof wx === 'undefined' || typeof wx.createImage !== 'function') return null
    if (this.images[path]) return this.images[path]
    const image = wx.createImage()
    image.src = path
    this.images[path] = image
    return image
  }
}

module.exports = AssetLoader
