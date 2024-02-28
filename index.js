const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const c = canvas.getContext('2d')

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 36) {
    collisionsMap.push(collisions.slice(i,i + 36))
}

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

const boundaries = []

const bullets = []

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 9373) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width,
                        y: i * Boundary.height
                    }
                })
            )
        }
    })
})

console.log(boundaries)

const backgroundImage = new Image()
backgroundImage.src = "./Assets/BackgroundNew.png"

const playerImage = new Image()
playerImage.src = "./Assets/goat animation.png"

backgroundImage.onload = () => {
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 500, 500 , (playerImage.width /4) * 2.2, (playerImage.height /5) * 2.2)
}

class Sprite {
    constructor({ position, velocity = 0, image, frames = { max: 4 }, direction}) {
        this.position = position
        this.velocity = velocity
        this.image = image
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.direction = direction

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false;
    }

    setXYDirection({x, y}) {
        this.xDirection = x
        this.yDirection = y
    }

    draw() {
        c.drawImage(
            this.image,
            (this.image.width / 4) * this.frames.val, 
            (this.image.height / 5) * this.direction,
            this.image.width / 4,
            this.image.height / 5,
            this.position.x,
            this.position.y,
            (this.image.width / 4) * 2.2,
            (this.image.height / 5) * 2.2
        )
        if (this.moving) {
            if (this.frames.max > 1) {
                this.frames.elapsed++
            }
            if (this.frames.elapsed % 10 == 0) {
                if (this.frames.val < this.frames.max) this.frames.val++
                else this.frames.val = 0
            }
        }
    }
}




const player = new Sprite({
    position: {
        x: 250,
        y: 250
    },
    image: playerImage,
    frames: {
        max: 3
    }, 
    direction: 0

})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

function getPlayerDirection(origin) {
    let xDistance = origin.position.x - player.position.x
    let yDistance = origin.position.y - player.position.y

    let direction = {x: xDistance / Math.abs(yDistance) * -1, y: yDistance / Math.abs(xDistance) * -1}

    /*
    if (Math.abs(xDistance) > Math.abs(yDistance)) {
        if (xDistance > 0) {
            direction = 2
        } else {
            direction = 3
        }
    } else {
        if (yDistance > 0) {
            direction = 1
        } else {
            direction = 0
        }
    }
    */

    return direction
}

function spawnBullet({origin, velocity}) {
    let direction = getPlayerDirection(origin)

    let bullet = new Sprite({
        position: {
            x: origin.position.x,
            y: origin.position.y
        },
        velocity: velocity,
        // PLACEHOLDER ASSET
        image: playerImage,
        frames: {
            max: 3
        }, 
        direction: 0
    })
    bullet.setXYDirection({x: direction.x, y: direction.y})
    bullet.moving = true

    bullets.push(bullet)
}

function updateBullet(bullet) {
    bullet.position.x += bullet.xDirection * bullet.velocity
    bullet.position.y += bullet.yDirection * bullet.velocity

    if (bullet.position.x < 0 || bullet.position.x > (35 * 32) || bullet.position.y < 0 || bullet.position.y > (17 * 32)) {
        bullets.splice(bullets.indexOf(bullet), 1)
    }
}

function rectangularCollision({rect1, rect2}) {
    if ((rect1.position.x + rect1.width >= rect2.position.x)) {
        console.log(rect1, rect2)
    }

    return (
        (rect1.position.x + rect1.width >= rect2.position.x)
        && (rect1.position.x <= rect2.position.x + rect2.width)
        && (rect1.position.y <= rect2.position.y + rect2.height)
        && (rect1.position.y + rect1.height / 2 >= rect2.position.y)
    )
}

function bulletCollision(bullet) {
    if (rectangularCollision({rect1: player, rect2: bullet})) {
        console.log("bullet collision")
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)


    boundaries.forEach(boundary => {
        boundary.draw()
    })

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw()
        //bulletCollision(bullets[i])
        updateBullet(bullets[i])
    }


    player.draw()


    let moving = true
    player.moving = false;

    if (keys.w == true) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 4
                        }
                    }
                })
            ) {
                console.log("colliding")
                moving = false
                break
            }
        }
        if (moving) {
            player.direction = 1
            player.moving = true
            player.position.y -= 3
        }
    }
    if (keys.s == true) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 4
                        }
                    }
                })
            ) {
                console.log("colliding")
                moving = false
                break
            }
        }
        if (moving) {
            player.direction = 0
            player.moving = true
            player.position.y += 3
        }
    }
    if (keys.a == true) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 4,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                console.log("colliding")
                moving = false
                break
            }
        }
        if (moving) {
            player.direction = 2
            player.moving = true
            player.position.x -= 3
        }
    }
    if (keys.d == true) {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 4,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                console.log("colliding")
                moving = false
                break
            }
        }
        if (moving) {
            player.direction = 3
            player.moving = true
            player.position.x += 3
        }
    }
}

spawnBullet({origin: {position: {x: 200, y: 200}}, velocity: 1})
spawnBullet({origin: {position: {x: 300, y: 300}}, velocity: 2})
spawnBullet({origin: {position: {x: 500, y: 200}}, velocity: 0.5})
spawnBullet({origin: {position: {x: 100, y: 300}}, velocity: 4})


animate()


window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w = true
            break;
        case 'a':
            keys.a = true
            break;
        case 's':
            keys.s = true
            break;
        case 'd':
            keys.d = true
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w = false
            break;
        case 'a':
            keys.a = false
            break;
        case 's':
            keys.s = false
            break;
        case 'd':
            keys.d = false
            break;
    }
})