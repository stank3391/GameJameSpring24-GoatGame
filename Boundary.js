const tileSize = 32

class Boundary {
    static width = tileSize
    static height = tileSize
    constructor({ position }) {
        this.position = position
        this.width = Boundary.width
        this.height = Boundary.height
    }
    draw() {
        var r_a = 0.3;
        c.fillStyle = "rgba(255, 0, 0, " + r_a + ")"; 
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
