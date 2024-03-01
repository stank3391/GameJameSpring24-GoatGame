const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const c = canvas.getContext('2d')

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 36) {
    collisionsMap.push(collisions.slice(i,i + 36))
}

const boundaries = []
const bullets = []
const milkMans = []

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

// TEMPORARY ASSET
const bulletImage = new Image()
bulletImage.src = "./Assets/goat animation.png"

const logoImage = new Image()
logoImage.src = "./Assets/logo.png"

const goatIce = new Image()
goatIce.src = "./Assets/goatIce2.png"

backgroundImage.onload = () => {
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)

    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 500, 500 , (playerImage.width / 4) , (playerImage.height /5))
}

class Sprite {
    static frameAnimationCount = 10
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

    // Setter for x and y direction (for diagonal directions)
    setXYDirection({x, y}) {
        this.xDirection = x
        this.yDirection = y
    }

    draw() {
        c.drawImage(
            this.image,
            this.image.width / 4 * this.frames.val, 
            this.image.height / 5 * this.direction,
            this.image.width / 4,
            this.image.height / 5,
            this.position.x,
            this.position.y,
            this.image.width / 4,
            this.image.height / 5,
        )
        if (this.moving) {
            if (this.frames.max > 1) this.frames.elapsed++
            if (this.frames.elapsed % Sprite.frameAnimationCount  == 0) {
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
    },
    enter: {
        pressed: false
    },
    reset: {
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
            velocity: {
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





// Get diagonal bullet direction toward player
function getPlayerDirection(origin) {
    // Get x and y distances to player
    let xDistance = origin.position.x - player.position.x
    let yDistance = origin.position.y - player.position.y

    // Get x and y... vector elements? is this a vector? is this how vectors work?? i just played around with these formulae until they looked and worked right
    let direction = {x: xDistance / Math.abs(yDistance) * -1, y: yDistance / Math.abs(xDistance) * -1}
    return direction
}

function spawnMilkMan({ origin, velocity }) {
    // Get direction to player
    let direction = getPlayerDirection(origin)

    // Create milkMan
    let milkMan = new Sprite({
        position: {
            x: origin.position.x,
            y: origin.position.y
        },
        velocity: velocity,
        image: bulletImage,
        frames: {
            max: 3
        },
        direction: 0
    })
    // Set bullet x and y direction, set bullet to moving
    milkMan.setXYDirection({ x: direction.x, y: direction.y })
    milkMan.moving = true

    // Set bullet width and height
    milkMan.width = 25
    milkMan.height = 25

    // Add bullet to array
    milkMans.push(milkMan)
}

// Move bullet forward
function updateMilkMan(milkMan) {
    // Increment bullet position by direction * velocity
    milkMan.position.x += milkMan.xDirection * milkMan.velocity
    milkMan.position.y += milkMan.yDirection * milkMan.velocity

    // If bullet reaches edge of screen, despawn (remove from array)
    if (milkMan.position.x < 0 || milkMan.position.x > (35 * 32 - milkMan.width / 2) || milkMan.position.y < 0 || milkMan.position.y > (17 * 32 - milkMan.height / 2)) {
        despawnMilkMan(milkMan)
    }
}

// Despawn bullet (remove from array)
function despawnMilkMan(milkMan) {
    milkMans.splice(milkMans.indexOf(milkMan), 1)
}


// Create bullet with specified origin and velocity
function spawnBullet({origin, velocity}) {
    // Get direction to player
    let direction = getPlayerDirection(origin)

    // Create bullet
    let bullet = new Sprite({
        position: {
            x: origin.position.x,
            y: origin.position.y
        },
        velocity: velocity,
        image: bulletImage,
        frames: {
            max: 3
        }, 
        direction: 0
    })
    // Set bullet x and y direction, set bullet to moving
    bullet.setXYDirection({x: direction.x, y: direction.y})
    bullet.moving = true

    // Set bullet width and height
    bullet.width = 25
    bullet.height = 25

    // Add bullet to array
    bullets.push(bullet)
}

// Move bullet forward
function updateBullet(bullet) {
    // Increment bullet position by direction * velocity
    bullet.position.x += bullet.xDirection * bullet.velocity
    bullet.position.y += bullet.yDirection * bullet.velocity

    // If bullet reaches edge of screen, despawn (remove from array)
    if (bullet.position.x < 0 || bullet.position.x > (35 * 32 - bullet.width / 2) || bullet.position.y < 0 || bullet.position.y > (17 * 32 - bullet.height / 2)) {
        despawnBullet(bullet)
    }
}

// Despawn bullet (remove from array)
function despawnBullet(bullet) {
    bullets.splice(bullets.indexOf(bullet), 1)
}

function rectangularCollision({rect1, rect2}) {
    return (
        (rect1.position.x + rect1.width >= rect2.position.x)
        && (rect1.position.x <= rect2.position.x + rect2.width)
        && (rect1.position.y <= rect2.position.y + rect2.height)
        && (rect1.position.y + rect1.height / 2 >= rect2.position.y)
    )
}






// Test for bullet collision
const speed = 3
function bulletCollision(bullet) {
    if (rectangularCollision({rect1: player, rect2: bullet})) {
        console.log("bullet collision")
        gameState = 2
        despawnBullet(bullet)

        //DIE
    }
}


let gameState = 0


function animate() {
    if (gameState == 0) {
        window.requestAnimationFrame(animate);
        c.drawImage(logoImage, 0, 0, canvas.width, canvas.height)
        console.log("state 0")
        if (keys.enter == true) {
            console.log('enter pressed')
            gameState = 1
        }
    }
    if (gameState == 1) {
        console.log("state 1")
        window.requestAnimationFrame(animate);
        c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)

        //boundaries.forEach(boundary => {
        //    boundary.draw()
        //})

        // Loop through bullets
        for (let i = 0; i < bullets.length; i++) {
            // Draw, check for collision, move forward
            bullets[i].draw()
            bulletCollision(bullets[i])
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
                                y: boundary.position.y + speed
                            }
                        }
                    })
                ) {
                    console.log("colliding w")
                    moving = false
                    break
                }
            }
            if (moving) {
                player.direction = 1
                player.moving = true
                player.position.y -= speed
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
                                y: boundary.position.y - speed
                            }
                        }
                    })
                ) {
                    console.log("colliding s")
                    moving = false
                    break
                }
            }
            if (moving) {
                player.direction = 0
                player.moving = true
                player.position.y += speed
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
                                x: boundary.position.x + speed,
                                y: boundary.position.y
                            }
                        }
                    })
                ) {
                    console.log("colliding a")
                    moving = false
                    break
                }
            }
            if (moving) {
                player.direction = 2
                player.moving = true
                player.position.x -= speed
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
                                x: boundary.position.x - speed,
                                y: boundary.position.y
                            }
                        }
                    })
                ) {
                    console.log("colliding d")
                    moving = false
                    break
                }
            }
            if (moving) {
                player.direction = 3
                player.moving = true
                player.position.x += speed
            }
        }
    }
   
    if (gameState == 2) {
        console.log("state 2")
        window.requestAnimationFrame(animate);
        c.fillRect(0, 0, canvas.width, canvas.height)
        c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
        c.drawImage(goatIce, 500, 200, 100, 100 * goatIce.height / goatIce.width)
        c.font = "48px serif"
        c.fillText("You got hit!", 600, 250)
        //add score later
        //let score = 10
        c.fillText('score:' + score, 600, 300)
        if (keys.reset == true) {
            bullets.forEach((element) => element.despawnBullet) //this should despawn bullets but it doesn't
            gameState = 1;
        }
    }
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}


function spawnBulletEveryCoupleSeconds() {
    // Call spawnBullet with the provided arguments
    spawnBullet({ origin: { position: { x: getRandomNumber(0, 1152), y: getRandomNumber(0,576) } }, velocity: getRandomNumber(0.5, 1) });
}

function spawnMilkManEveryCoupleSeconds() {
    // Call spawnBullet with the provided arguments
    spawnMilkMan({ origin: { position: { x: getRandomNumber(0, 1152), y: getRandomNumber(0, 576) } }, velocity: getRandomNumber(0.5, 1) });
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
        case 'y':
            keys.enter = true
            break;
        case 'r':
            keys.reset = true
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
        case 'y':
            keys.enter = false
            break;
        case 'r':
            keys.reset = false
            break;
    }
})