export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  preload() {

    this.load.spritesheet('player', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('ground', './assets/platform.png');
    this.load.image('coin', './assets/star.png');
    this.load.image('sky', './assets/sky.png');

    this.load.audio('jump', './assets/jump.wav');
    this.load.audio('pick', './assets/pick.wav');
  }

  create() {

    // Anims
    this.anims.create({
      key: 'walk_left',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [0, 1, 2, 3]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [4]
      })
    });

    this.anims.create({
      key: 'walk_right',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [5, 6, 7, 8]
      }),
      frameRate: 10,
      repeat: -1
    });

    // Sounds
    this.jumpSound = this.sound.add('jump');
    this.pickSound = this.sound.add('pick');

    // Sprites
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.coins = this.physics.add.group({ immovable: true, allowGravity: false });
    this.coins.create(100, 150, 'coin');
    this.coins.create(700, 64, 'coin');
    this.coins.create(500, 370, 'coin');

    this.player = this.physics.add.sprite(32, 500, 'player');
    this.player.anims.play('idle');
    this.player.body.setCollideWorldBounds(true);

    // Physics
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collisionPlayerCoin, null, this);

    // Gameplay
    this.controller = this.input.keyboard.createCursorKeys();
    this.coins = 0;
    this.coinsText = this.add.text(32, 32, 'Score: ' + this.coins);

  }

  update(time, delta) {

    if (this.controller.left.isDown) {
      this.player.body.setVelocityX(-200);
      if (this.player.anims.getCurrentKey() != 'walk_left') {
        this.player.anims.play('walk_left');
      }
    }
    else if (this.controller.right.isDown) {
      this.player.body.setVelocityX(200);
      if (this.player.anims.getCurrentKey() != 'walk_right') {
        this.player.anims.play('walk_right');
      }
    }

    if (Phaser.Input.Keyboard.JustUp(this.controller.right) ||
      Phaser.Input.Keyboard.JustUp(this.controller.left)) {
      this.player.body.setVelocityX(0);
      if (this.player.anims.getCurrentKey() != 'idle') {
        this.player.anims.play('idle');
      }
    }

    if (this.controller.space.isDown && this.player.body.touching.down) {
      this.player.body.setVelocityY(-300);
      this.jumpSound.play();
    }

  }

  collisionPlayerCoin(player, coin) {
    coin.destroy();
    this.coins++;
    this.coinsText.setText('Score: ' + this.coins);
    this.pickSound.play();
  }
}