class SceneManager {
  constructor() {
    this.currentScene = null
  }

  change(scene) {
    if (this.currentScene && this.currentScene.exit) this.currentScene.exit()
    this.currentScene = scene
    if (this.currentScene && this.currentScene.enter) this.currentScene.enter()
  }

  update(deltaTime) {
    if (this.currentScene && this.currentScene.update) this.currentScene.update(deltaTime)
  }

  draw(context) {
    if (this.currentScene && this.currentScene.draw) this.currentScene.draw(context)
  }

  handleTap(x, y) {
    if (this.currentScene && this.currentScene.handleTap) this.currentScene.handleTap(x, y)
  }
}

module.exports = SceneManager
