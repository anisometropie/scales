class Button extends Component {
    constructor(aGridX, aGridY) {
        super(aGridX, aGridY);
        this.name = "\u25B6";
        this.radius = 8;
    }

    display() {
        push();
        if (this.isMouseOver() || this.isBeingMoved) {
            fill(color(204, 255, 153));
        }
        rectMode(CENTER);
        rect(this.xPixel, this.yPixel-3, this.radius * 2, this.radius * 2,);
        fill(color(0));
        textAlign(CENTER, CENTER);
        textSize(this.radius);
        text(this.name, this.xPixel, this.yPixel-3);
        pop();
    }

}
