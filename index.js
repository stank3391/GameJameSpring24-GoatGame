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
    c.drawImage(playerImage, 0, 0, playerImage.width / 4, playerImage.height / 5, 0, 0 , (playerImage.width /4) * 2.2, (playerImage.height /5) * 2.2)
}