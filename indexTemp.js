//====================Set Up=========================
const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const c = canvas.getContext('2d')

const speed = 3
const collisionsMap = []
const boundaries = []
const backgroundImage = new Image()
const enemies = []
const bullets = []
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

// Score
let score = 0

//===================Auxilliary Functions=================
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

//=============Collisions & Boundaries=============================
//Set up Collisions Map
for (let i = 0; i < collisions.length; i += 36) {
    collisionsMap.push(collisions.slice(i, i + 36))
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 9373) {
            boundaries.push(
                new Boundary({ position: { x: j * Boundary.width, y: i * Boundary.height } })
            )
        }
    })
})


//====================Background========================
backgroundImage.src = "./Assets/BackgroundNew.png"

backgroundImage.onload = () => {
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 500, 500, (playerImage.width / 4), (playerImage.height / 5))
}



//================Player Stuff==============================
const playerImage = new Image()
playerImage.src = "./Assets/goat animation.png"

class Sprite {
    static frameAnimationCount = 10

    constructor({ position, velocity = 0, image, frames = { max: 4 }, direction, widthOfSprite, heighOfSprite }) {
        this.position = position
        this.velocity = velocity
        this.image = image
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.direction = direction
        this.widthOfSprite = widthOfSprite
        this.heighOfSprite = heighOfSprite
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false;
    }

    setXYDirection({ x, y }) {
        this.xDirection = x
        this.yDirection = y
    }

    draw() {
        c.drawImage(
            this.image,
            this.image.width / this.heighOfSprite * this.frames.val,
            this.image.height / this.heighOfSprite * this.direction,
            this.image.width / this.widthOfSprite,
            this.image.height / this.heighOfSprite, 
            this.position.x,
            this.position.y,
            this.image.width / this.widthOfSprite,
            this.image.height / this.heighOfSprite
        )
        if (this.moving) {
            if (this.frames.max > 1) this.frames.elapsed++
            if (this.frames.elapsed % Sprite.frameAnimationCount == 0) {
                if (this.frames.val < this.frames.max) this.frames.val++
                else this.frames.val = 0
            }
        }
    }

    updatePosition() {
        if (this.position.x <= 0 || this.position.x >= backgroundImage.width) {
            this.velocity.x = -this.velocity.x;
        }

        this.position.y += this.velocity.y;
        if (this.position.y <= 0 || this.position.y >= backgroundImage.height) {
            this.velocity.y = -this.velocity.y;
        }
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
    direction: 0,
    widthOfSprite: 4,
    heighOfSprite: 5
})





//=====================Bullet Stuff==========================
const bulletImage = new Image()
bulletImage.src = "./Assets/Icecream.png"

// Get diagonal bullet direction toward player
function getPlayerDirection(origin) {
    // Get x and y distances to player
    let xDistance = origin.position.x - player.position.x
    let yDistance = origin.position.y - player.position.y

    // Get x and y... vector elements? is this a vector? is this how vectors work?? i just played around with these formulae until they looked and worked right
    let direction = { x: xDistance / Math.abs(yDistance) * -1, y: yDistance / Math.abs(xDistance) * -1 }
    return direction
}

// Create bullet with specified origin and velocity
function spawnBullet({ origin, velocity }) {
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
        direction: 0,
        widthOfSprite: 4,
        heighOfSprite: 1
    })
    // Set bullet x and y direction
    bullet.setXYDirection({ x: direction.x, y: direction.y })
    // TEMPORARILY DISABLED ANIMATION
    //bullet.moving = true

    // Set bullet width and height
    bullet.width = 12
    bullet.height = 29

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

function rectangularCollision({ rect1, rect2 }) {
    return (
        ((Math.trunc(rect1.position.x) + rect1.width >= rect2.position.x)
        && (Math.trunc(rect1.position.x) <= rect2.position.x + rect2.width)
        && (Math.trunc(rect1.position.y) <= rect2.position.y + rect2.height)
        && (Math.trunc(rect1.position.y) + rect1.height / 2 >= rect2.position.y))
    )
}


// Test for bullet collision
function bulletCollision(bullet) {
    if (rectangularCollision({ rect1: player, rect2: bullet })) {
        console.log("bullet collision")
        despawnBullet(bullet)

        // Decrement score
        score--

        //DIE
        return 0
    }
}

function spawnBulletEveryCoupleSeconds() {
    // Call spawnBullet with the provided arguments
    if (enemies.length > 0) {
        let enemyID = Math.round(getRandomNumber(0, enemies.length - 1))
        let enemyX = enemies[enemyID].position.x
        let enemyY = enemies[enemyID].position.y
        spawnBullet({ origin: { position: { x: enemyX, y: enemyY } }, velocity: getRandomNumber(0.5, 1) });
    }
}

//=========================MilkMan Stuff=======================
const milkImage = new Image();
milkImage.src = './Assets/Milkman/MilkManAnimation.png'

function spawnEnemy() {
        const enemy = new Sprite({
            position: {
                x: getRandomNumber(100, 1000),
                y: getRandomNumber(50, 400)
            },
            velocity: {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1
            },
            image: milkImage,
            frames: {
                max: 8
            },
            direction: 0,
            widthOfSprite: 8,
            heighOfSprite: 4
        });

        enemy.width = 30
        enemy.height = 43

        // Add the enemy sprite to the game
        enemies.push(enemy);
}

function despawnEnemy(enemy) {
    enemies.splice(enemies.indexOf(enemy), 1)
}

function spawnEnemyEveryCoupleSeconds() {
    // Call spawnBullet with the provided arguments
    spawnEnemy();
}

function enemyCollision(enemy) {
    if (rectangularCollision({ rect1: player, rect2: enemy })) {
        console.log("enemy collision")
        console.log(player)
        console.log(enemy)
        despawnEnemy(enemy)

        // Increment score
        score++

        //DIE
        //return 0;
    }
}





//=====================Animate========================
function animate() {
    window.requestAnimationFrame(animate);
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
    // Loop through bullets
    for (let i = 0; i < bullets.length; i++) {
        // Draw, check for collision, move forward
        bullets[i].draw()
        if (bulletCollision(bullets[i]) != 0) {
            updateBullet(bullets[i])
        }
    }

    // Loop through enemies
    for (let j = 0; j < enemies.length; j++) {
        // Draw, check for collision, move forward
        enemies[j].draw()
        enemyCollision(enemies[j])
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
                //console.log("colliding w")
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
                //console.log("colliding s")
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
                //console.log("colliding a")
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
                //console.log("colliding d")
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


animate()

//Pressing Down
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

//Lifting up
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