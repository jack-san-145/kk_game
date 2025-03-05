const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,  // Full screen width
    height: window.innerHeight, // Full screen height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update

    }
};

const game = new Phaser.Game(config);

let player;
let box; // The obstacle (box)
let playerBoxCollider;
let isMoving = true;
let questionOverlay;
let questionText;
let inputField;
let submitButton;
let correctAnswer = "4";
let cursors;

function preload() {
    this.load.image('sky', 'learning-game/assets/tileset.png');
    this.load.image('box', 'learning-game/assets/Crate.png'); // Load the box image
    this.load.image('drygrass', 'learning-game/assets/DryGrass.png');
    this.load.image('LCactus', 'learning-game/assets/LargeCactus.png');
    this.load.image('Direction', 'learning-game/assets/SignArrow.png');
    this.load.spritesheet('dude', 
        'learning-game/assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    // Add background and stretch it to cover the entire screen
    const bg = this.add.image(0, 0, 'sky').setOrigin(0, 0);
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Create platforms (using a solid color ground instead of an image)
    const ground = this.add.rectangle(
        this.sys.game.config.width / 2, 
        this.sys.game.config.height - 20, 
        this.sys.game.config.width, 
        40, 
        0x654321 // Brown color
    );
    this.physics.add.existing(ground, true); // Make it static physics object

    // Add decorative elements (non-collidable)
    this.add.image(300, 750, 'drygrass').setScale(0.7); 
    this.add.image(900, 750, 'drygrass').setScale(0.7);
    this.add.image(1200, 763, 'drygrass').setScale(0.3);
    this.add.image(50, 646, 'Direction').setScale(0.5);
    this.add.image(460, 717.3, 'LCactus').setScale(1); 
    this.add.image(1400, 717.3, 'LCactus').setScale(1); 
    this.add.image(1140, 600.3, 'Direction').setScale(1); 

    // Create player
    player = this.physics.add.sprite(100, this.sys.game.config.height - 150, 'dude').setScale(3.0);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Collide player with ground
    this.physics.add.collider(player, ground);

    // Create the box obstacle
    box = this.physics.add.staticSprite(700, this.sys.game.config.height - 110, 'box').setScale(1.5);

    playerBoxCollider = this.physics.add.collider(player, box, hitBox, null, this);

    // Input events
    cursors = this.input.keyboard.createCursorKeys();

    // Start running after a delay
    this.time.delayedCall(1000, () => startRunning());

    // Create the question overlay
    createQuestionOverlay(this);

    // Make the game fullscreen when pressing F
    this.input.keyboard.on('keydown-F', () => {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        } else {
            this.scale.stopFullscreen();
        }
    });
}
function update() 
{
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-200);
    }
}

function startRunning() {
    isMoving = true;
    player.setVelocityX(160);
    player.anims.play('right', true);
}

function hitBox(player, box) {
    isMoving = false;
    player.setVelocityX(0);
    showQuestion();
}

function createQuestionOverlay(scene) {
    // Create a container for the overlay outside the game canvas
    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.display = 'none';
    overlayContainer.style.justifyContent = 'center';
    overlayContainer.style.alignItems = 'center';
    overlayContainer.style.zIndex = '1000';
    document.body.appendChild(overlayContainer);

    // Create the white overlay
    const overlay = document.createElement('div');
    overlay.style.width = '400px';
    overlay.style.height = '200px';
    overlay.style.backgroundColor = '#ffffff';
    overlay.style.borderRadius = '10px';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlayContainer.appendChild(overlay);
    
    // Add the question text
    const question = document.createElement('div');
    question.innerText = 'What is 2 + 2?';
    question.style.fontSize = '20px';
    question.style.color = '#000000';
    question.style.marginBottom = '20px';
    overlay.appendChild(question);

    // Add the input field
    inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.style.width = '100px';
    inputField.style.height = '30px';
    inputField.style.fontSize = '18px';
    inputField.style.textAlign = 'center';
    overlay.appendChild(inputField);

    // Add the submit button
    submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.style.width = '80px';
    submitButton.style.height = '30px';
    submitButton.style.fontSize = '18px';
    submitButton.style.marginTop = '20px';
    overlay.appendChild(submitButton);

    // Store the overlay container for later use
    questionOverlay = overlayContainer;

    // Add event listener for the submit button
    submitButton.addEventListener('click', checkAnswer(this));
    document.addEventListener('keydown',(event)=>{
        if(event.key=="Enter")
        {
            checkAnswer(this);
        }
    });
}

function showQuestion() {
    // Apply blur to the game canvas
    const canvas = document.querySelector('canvas');
    canvas.style.filter = 'blur(5px)';

    // Show the question overlay
    questionOverlay.style.display = 'flex';
}

function checkAnswer(scene) {
    if (inputField.value === correctAnswer) {
        // Remove blur from the game canvas
        const canvas = document.querySelector('canvas');
        canvas.style.filter = 'none';

        // Hide the question overlay
        questionOverlay.style.display = 'none';

        // Make the player jump and resume running
        player.setVelocityY(-200);
        setTimeout(() => startRunning(),100);
         
        // Disable the box's collision so the player can pass
        box.destroy();
    }
    inputField.value = '';
}

// Resize the game when the window resizes
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});