import type { MindElixirInstance } from '../types/index'

export default {
  moved: false, // diffrentiate click and move
  mousedown: false,
  onMove(e: MouseEvent, mind: MindElixirInstance) {
    if (this.mousedown) {
      // if > 2px, moved true
      if (e.movementX * e.movementX + e.movementY * e.movementY >= 4) {
        this.moved = true
      }
      mind.translateVal.x = e.clientX - mind.startPoint.x
      mind.translateVal.y = e.clientY - mind.startPoint.y
      const { map, scaleVal } = mind

      map.style.transform = `translate(${mind.translateVal.x}px, ${mind.translateVal.y}px) scale(${scaleVal})`
    }
  },
  clear() {
    // delay to avoid trigger contextmenu
    setTimeout(() => {
      this.moved = false
      this.mousedown = false
    }, 0)
  },
}
