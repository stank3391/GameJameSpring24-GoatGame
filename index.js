const canvas = document.querySelector('canvas')
canvas.width = 1024
canvas.height = 576

const c = canvas.getContext('2d')

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const backgroundImage = new Image()
backgroundImage.src = "./Assets/Background.png"

const playerImage = new Image()
playerImage.src = "./Assets/goat animation.png"

backgroundImage.onload = () => {
    const scale = canvas.width / backgroundImage.width;
    console.log (scale)
    c.drawImage(backgroundImage, 0, 0, backgroundImage.width * scale, backgroundImage.height * scale)
    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 500, 500 , (playerImage.width /4) * 2.2, (playerImage.height /5) * 2.2)
}


class Sprite {
    constructor({ position, velocity, image }) {
        this.position = positon
        this.image = image
    }

    draw() {
        c.drawImage(image, 0, 0, backgroundImage.width * scale, backgroundImage.height * scale)

    }
}
const background = new Sprite({ postion: {x: 0, y: 0}, image: image })

function animate() {
    window.requestAnimationFrame(animate);
    background.draw()
    c.drawImage(
        playerImage,
        0,
        0,
        playerImage.width / 4,
        playerImage.height / 5,
        500,
        500,
        (playerImage.width / 4) * 2.2,
        (playerImage.height / 5) * 2.2)
}

animate()

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            console.log('pressed w')
            break;
        case 'a':
            console.log('pressed a')
            break;
        case 's':
            console.log('pressed s')
            break;
        case 'd':
            console.log('pressed d')
            break;
    }
})