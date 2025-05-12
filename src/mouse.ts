import type { SummarySvgGroup } from './summary'
import type { Expander, CustomSvg } from './types/dom'
import type { MindElixirInstance } from './types/index'
import { isTopic } from './utils'
import dragMoveHelper from './utils/dragMoveHelper'

export default function (mind: MindElixirInstance) {
  mind.map.addEventListener('click', e => {
    if (e.button !== 0) return
    if (mind.helper1?.moved) {
      mind.helper1.clear()
      return
    }
    if (mind.helper2?.moved) {
      mind.helper2.clear()
      return
    }
    if (dragMoveHelper.moved) {
      dragMoveHelper.clear()
      return
    }
    mind.clearSelection()
    // e.preventDefault() // can cause <a /> tags don't work
    const target = e.target as HTMLElement
    if (target.tagName === 'ME-EPD') {
      mind.expandNode((target as Expander).previousSibling)
    } else if (isTopic(target)) {
      mind.selectNode(target, false, e)
    } else if (!mind.editable) {
      return
    } else if (target.tagName === 'text') {
      if (target.dataset.type === 'custom-link') {
        mind.selectArrow(target.parentElement as unknown as CustomSvg)
      } else {
        mind.selectSummary(target.parentElement as unknown as SummarySvgGroup)
      }
    } else if (target.className === 'circle') {
      // skip circle
    }
  })

  mind.map.addEventListener('dblclick', e => {
    if (!mind.editable) return
    const target = e.target as HTMLElement
    if (isTopic(target)) {
      mind.beginEdit(target)
    } else if (target.tagName === 'text') {
      if (target.dataset.type === 'custom-link') {
        mind.editArrowLabel(target.parentElement as unknown as CustomSvg)
      } else {
        mind.editSummary(target.parentElement as unknown as SummarySvgGroup)
      }
    }
  })

  /**
   * drag and move the map
   */
  mind.map.addEventListener('mousemove', e => {
    // click trigger mousemove in windows chrome
    if ((e.target as HTMLElement).contentEditable === 'inherit') {
      dragMoveHelper.onMove(e, mind)
    }
  })
  mind.map.addEventListener('mousedown', e => {
    if (e.button !== mind.mouseMoveButton) return
    if ((e.target as HTMLElement).contentEditable === 'inherit') {
      dragMoveHelper.moved = false
      dragMoveHelper.mousedown = true
      mind.startPoint = {
        x: e.clientX - mind.translateVal.x,
        y: e.clientY - mind.translateVal.y,
      }
    }
  })
  mind.map.addEventListener('mouseleave', e => {
    if (e.button !== mind.mouseMoveButton) return
    dragMoveHelper.clear()
  })
  mind.map.addEventListener('mouseup', e => {
    if (e.button !== mind.mouseMoveButton) return
    dragMoveHelper.clear()
  })
  mind.container.addEventListener('wheel', (e: WheelEvent) => {
    console.log('zoom', e)
    e.preventDefault()

    let scale = mind.scaleVal
    const translate = mind.translateVal

    const containerRect = mind.container.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    if (x < 0 || x > containerRect.width || y < 0 || y > containerRect.height) return

    const xs = (x - translate.x) / scale
    const ys = (y - translate.y) / scale

    e.deltaY < 0 ? (scale *= 1.2) : (scale /= 1.2)
    if (scale > 1.6 || scale < 0.6) return
    mind.scaleVal = scale
    mind.translateVal = {
      x: x - xs * scale,
      y: y - ys * scale,
    }

    mind.map.style.transform = `translate(${mind.translateVal.x}px, ${mind.translateVal.y}px) scale(${mind.scaleVal})`

    e.stopPropagation()
  })
}
