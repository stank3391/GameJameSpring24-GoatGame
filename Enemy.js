const milkImage = new Image();
milkImage.src = './Assests/Milkman/MilkManAnimation.png'

export class Enemy {
    constructor() {
         // Create enemy element
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        
        // Create image element for the sprite
        this.sprite = document.createElement('img');
        this.sprite.src = milkImage.src;
        this.sprite.style.width = '250px';
        this.sprite.style.height = '250px';
        this.element.appendChild(this.sprite);
        
        // Set enemy position
        this.element.style.position = 'absolute';
        this.element.style.top = Math.random() * window.innerHeight + 'px';
        this.element.style.left = Math.random() * window.innerWidth + 'px';
        
        // Append enemy to the game area
        document.body.appendChild(this.element);
    }
}

export class EnemySpawner {
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
        // Once the image is loaded, create the enemy sprite
        milkImage.onload = () => {
            const enemy = new Sprite({
                position: {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                },
                image: enemyImage,
                frames: { max: 4 },
                direction: 0
            });
            
            // Add the enemy sprite to the game
            enemies.push(enemy);
        };
    }
}