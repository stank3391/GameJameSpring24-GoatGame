const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const c = canvas.getContext('2d')

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const backgroundImage = new Image()
backgroundImage.src = "./Assets/Background.png"

const playerImage = new Image()
playerImage.src = "./Assets/goat animation.png"

backgroundImage.onload = () => {
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 500, 500 , (playerImage.width /4) * 2.2, (playerImage.height /5) * 2.2)
}


class Sprite {
    constructor({ position, velocity, image, frames = { max: 4 }, direction}) {
        this.position = position
        this.image = image
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.direction = direction

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
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
}
const player = new Sprite({
    position: {
        x: 500,
        y: 500
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
function animate() {
    window.requestAnimationFrame(animate);
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height)
    player.draw()
    let moving = false
    player.moving = false;


    if (keys.w == true) {
        player.direction = 1
        player.moving = true
        player.position.y -= 3
    }
    if (keys.s == true) {
        player.direction = 0
        player.moving = true
        player.position.y += 3
    }
    if (keys.a == true) {
        player.direction = 2
        player.moving = true
        player.position.x -= 3
    }
    if (keys.d == true) {
        player.direction = 3
        player.moving = true
        player.position.x += 3
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