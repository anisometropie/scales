class Component {
  constructor(aGridX, aGridY) {
    this.xGrid = aGridX
    this.yGrid = aGridY
    this.pYGrid = aGridY
    this.xPixel
    this.yPixel
    this.isBeingMoved = false
    this.mapPixelCoords()
  }

  isMouseOver() {
    return dist(mouseX, mouseY, this.xPixel, this.yPixel) < this.radius
  }

  mapPixelCoords() {
    this.xPixel = map(
      this.xGrid,
      0,
      maxNumberOfScales - 1,
      margin,
      width - margin
    )
    this.yPixel = map(this.yGrid, 0, numberOfSteps - 1, height - margin, margin)
  }

  mapGridCoords() {
    this.xGrid = Math.round(
      map(this.xPixel, margin, width - margin, 0, maxNumberOfScales - 1)
    )
    this.yGrid = Math.round(
      map(this.yPixel, height - margin, margin, 0, numberOfSteps - 1)
    )
  }
}
