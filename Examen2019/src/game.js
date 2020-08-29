export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  preload() {

    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('ball', './assets/ball.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 64, frameHeight: 64 });

    this.load.image('wallh', './assets/wallh.png');
    this.load.image('wallv', './assets/wallv.png');

    this.load.audio('spawn', './assets/spawn.wav');
    this.load.audio('despawn', './assets/despawn.wav');

  }

  create() {

    // Animations
    this.anims.create({
      key: 'player_idle',
      frames: this.anims.generateFrameNumbers('player', { frames: [1] }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_move',
      frames: this.anims.generateFrameNumbers('player', { frames: [0] })
    });

    this.anims.create({
      key: 'ball_move',
      frames: this.anims.generateFrameNumbers('ball', { frames: [0] })
    });

    this.anims.create({
      key: 'ball_divide',
      frames: this.anims.generateFrameNumbers('ball', { frames: [0, 1, 2] }),
      frameRate: 5,
      repeat: 2
    });

    this.anims.create({
      key: 'ball_destroy',
      frames: this.anims.generateFrameNumbers('explosion'),
      frameRate: 100
    });

    this.anims.get('ball_divide').on('complete', this.animComplete);
    this.anims.get('ball_destroy').on('complete', this.animComplete);

    // Sounds
    this.spawnSound = this.sound.add('spawn');
    this.despawnSound = this.sound.add('despawn');

    // Sprites
    this.walls = this.physics.add.staticGroup();
    this.walls.create(400, 16, 'wallh');
    this.walls.create(400, 584, 'wallh');
    this.walls.create(16, 400, 'wallv');
    this.walls.create(784, 400, 'wallv');

    this.balls = this.physics.add.group();
    var ball = this.balls.create(
      Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), 'ball'
    );
    ball.body.setVelocity(
      Phaser.Math.Between(200, 250), Phaser.Math.Between(200, 250));
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(1, 1);
    ball.anims.play('ball_move');
    ball.setScale(2);

    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.anims.play('player_idle');
    this.player.body.setCollideWorldBounds(true);

    // Physics
    this.physics.add.collider(this.balls, this.walls);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.balls, this.collisionPlayerBall, null, this);

    // Gameplay
    this.controller = this.input.keyboard.createCursorKeys();
    this.playerSpeed = 20;
    this.collisions = 15;
    this.countdown = 30;

    // UI
    this.timeText = this.add.text(32, 32, 'Time: ' + this.countdown);
    this.timeEvent = this.time.addEvent({ delay: 1000, callback: this.onOneSecondPassed, callbackScope: this, loop: true });
    this.collisionsText = this.add.text(200, 32, 'Collisions left: ' + this.collisions);
  }

  update(time, delta) {
    this.handleInput(delta);
  }

  handleInput(delta) {

    if (this.controller.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed * delta);
      if (this.player.anims.getCurrentKey() != 'player_move') {
        this.player.anims.play('player_move');
      }
    }
    else if (this.controller.down.isDown) {
      this.player.setVelocityY(this.playerSpeed * delta);
      if (this.player.anims.getCurrentKey() != 'player_move') {
        this.player.anims.play('player_move');
      }
    }

    if (this.controller.left.isDown) {
      this.player.setFlipX(false);
      this.player.setVelocityX(-this.playerSpeed * delta);
      if (this.player.anims.getCurrentKey() != 'player_move') {
        this.player.anims.play('player_move');
      }
    }
    else if (this.controller.right.isDown) {
      this.player.setFlipX(true);
      this.player.setVelocityX(this.playerSpeed * delta);
      if (this.player.anims.getCurrentKey() != 'player_move') {
        this.player.anims.play('player_move');
      }
    }

    if (Phaser.Input.Keyboard.JustUp(this.controller.up) ||
      Phaser.Input.Keyboard.JustUp(this.controller.left) ||
      Phaser.Input.Keyboard.JustUp(this.controller.down) ||
      Phaser.Input.Keyboard.JustUp(this.controller.right)) {
      this.player.setVelocity(0, 0);
      if (this.player.anims.getCurrentKey() != 'player_idle') {
        this.player.anims.play('player_idle');
      }
    }

    if (this.controller.space.isDown) {
      if (this.player.body.enable == false) {
        this.scene.start('main');
      }
    }

  }

  addBall(x, y) {
    var ball = this.balls.create(x, y, 'ball');
    ball.body.setVelocity(Phaser.Math.Between(200, 250), Phaser.Math.Between(200, 250));
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(1, 1);
    ball.anims.play('ball_divide');
    return ball;
  }

  collisionPlayerBall(player, ball) {

    if (ball.anims.getCurrentKey() == 'ball_move') {

      this.collisions--;
      this.collisionsText.setText('Collisions left: ' + this.collisions);
 
      if (ball.scale == 0.25) {
        ball.setScale(1.0);
        ball.anims.play('ball_destroy');
        this.despawnSound.play();
      }
      else {

        ball.destroy();
        this.addBall(ball.x, ball.y).setScale(ball.scale / 2.0);
        this.addBall(ball.x, ball.y).setScale(ball.scale / 2.0);
        this.spawnSound.play();
      }

      if (this.collisions == 0) {
        this.endGame(true);
      };
    }

  }

  animComplete(anim, frame, sprite) {
    if (anim.key == 'ball_divide') {
      sprite.anims.play('ball_move');
    }
    else if (anim.key == 'ball_destroy') {
      sprite.destroy();

    }
  }

  onOneSecondPassed() {
    this.countdown -= 1;
    if (this.countdown < 0) {
      this.endGame(false);
    }
    else {
      this.timeText.setText('Time: ' + this.countdown);
    }
  }

  endGame(win) {
    this.timeEvent.remove();
    this.player.body.setEnable(false);
    Phaser.Actions.Call(this.balls.getChildren(), function (ball) {
      ball.body.setEnable(false);
    });
    if (win) this.add.text(310, 300, 'GAME OVER! YOU WIN!');
    else this.add.text(310, 300, 'GAME OVER! YOU LOSE!');
    this.add.text(290, 340, 'Press SPACE to continue');
  }
}