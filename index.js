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
    constructor({ position, velocity, image, frames = { max: 4 }, direction}) {
        this.position = position;
        this.velocity = velocity;
        this.image = image;
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.direction = direction;

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        };
        this.moving = false;

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

    // Add a method to update the sprite's position
    updatePosition() {
        // Check if the enemy reaches or exceeds the left or right edge of the backgroundImage
        if (this.position.x <= 0 || this.position.x >= backgroundImage.width) {
            // Reverse the x velocity to make the enemy bounce back
            this.velocity.x = -this.velocity.x;
        }

        // Update y position
        this.position.y += this.velocity.y;
        // Check if the enemy reaches or exceeds the top or bottom edge of the backgroundImage
        if (this.position.y <= 0 || this.position.y >= backgroundImage.height) {
            // Reverse the y velocity to make the enemy bounce back
            this.velocity.y = -this.velocity.y;
        }
        // Update x position
        this.position.x += this.velocity.x;
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

const milkImage = new Image();
milkImage.src = './Assets/Milkman/MilkManAnimation.png'
class EnemySpawner {
    constructor(interval) {
        this.interval = interval;
        this.spawnInterval = null;
    }

    startSpawning() {
        this.spawnInterval = setInterval(() => {
            this.spawnEnemy();
        }, this.interval);
    }

    stopSpawning() {
        clearInterval(this.spawnInterval);
    }

    spawnEnemy() {
        // Create the enemy sprite immediately
        const enemy = new Sprite({
            position: {
                x: Math.random() * (backgroundImage.width - playerImage.width),
                y: Math.random() * (backgroundImage.height - playerImage.height)
            },
            velocity:{
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1
            },
            image: milkImage,
            frames: {
                max: 3
            }, 
            direction: 0
        });
    
        // Add the enemy sprite to the game
        enemies.push(enemy);
    }
}

function rectangularCollision({rect1, rect2 }) {
    return (
        (rect1.position.x + rect1.width >= rect2.position.x)
        && (rect1.position.x <= rect2.position.x + rect2.width)
        && (rect1.position.y <= rect2.position.y + rect2.height)
        && (rect1.position.y + rect1.height / 2 >= rect2.position.y)
    )
}

const enemies = []; // Array to hold enemy sprites
// Create an instance of EnemySpawner with a spawn interval of 3 seconds
const enemySpawner = new EnemySpawner(2000);
// Start spawning enemies
milkImage.onload = () => {
    // Start spawning enemies after the milk image has loaded
    enemySpawner.startSpawning();
};

function animate() {
    window.requestAnimationFrame(animate);
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)

    boundaries.forEach(boundary => {
        boundary.draw()
    })

    // Draw enemies
    enemies.forEach(enemy => {
        enemy.updatePosition();
        enemy.draw();
    })

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

