export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
  }

  preload() {

    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 64, frameHeight: 64 });

    this.load.image('wallh', './assets/wallh.png');
    this.load.image('wallv', './assets/wallv.png');
    this.load.image('door', './assets/door.png');
    this.load.image('bow', './assets/bow.png');
    this.load.image('key', './assets/key.png');
    this.load.image('arrowh', './assets/arrowh.png');
    this.load.image('arrowv', './assets/arrowv.png');

    this.load.audio('dungeon', './assets/dungeon.mp3');
    this.load.audio('shoot', './assets/shoot.wav');
    this.load.audio('item', './assets/item.wav');
    this.load.audio('pick', './assets/pick.wav');
    this.load.audio('solved', './assets/solved.wav');
    this.load.audio('hurt', './assets/hurt.wav');
    this.load.audio('death', './assets/death.wav');
    this.load.audio('open', './assets/open.wav');
    this.load.audio('hit', './assets/hit.wav');
    this.load.audio('miss', './assets/miss.wav');
  }

  create() {

    // Animations
    this.anims.create({
      key: 'player_walk',
      frames: this.anims.generateFrameNumbers('player'),
      frameRate: 16,
      repeat: -1
    });

    this.anims.create({
      key: 'player_idle',
      frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
      frameRate: 10
    });

    this.anims.create({
      key: 'enemy_idle',
      frames: this.anims.generateFrameNumbers('enemy'),
      frameRate: 10,
      repeat: -1
    });

    // Input
    this.controller = this.input.keyboard.createCursorKeys();

    // Sound
    this.itemSound = this.sound.add('item');
    this.pickSound = this.sound.add('pick');
    this.shootSound = this.sound.add('shoot');
    this.solvedSound = this.sound.add('solved');
    this.hurtSound = this.sound.add('hurt');
    this.deathSound = this.sound.add('death');
    this.openSound = this.sound.add('open');
    this.hitSound = this.sound.add('hit');
    this.missSound = this.sound.add('miss');
    this.music = this.sound.add('dungeon', { volume: 0.5, loop: true });
    this.music.play();

    // Sprites
    this.walls = this.physics.add.staticGroup();
    this.walls.create(-40, 16, 'wallh');
    this.walls.create(840, 16, 'wallh');
    this.walls.create(400, 584, 'wallh');
    this.walls.create(16, 400, 'wallv');
    this.walls.create(784, 400, 'wallv');

    this.door = this.physics.add.staticImage(400, 24, 'door');
    this.bow = this.physics.add.staticImage(
      Phaser.Math.Between(48, 752), Phaser.Math.Between(48, 552), 'bow');
    this.arrows = this.physics.add.group();

    this.enemies = this.physics.add.staticGroup();
    this.enemies.create(Phaser.Math.Between(64, 736), Phaser.Math.Between(64, 536), 'enemy');
    this.enemies.create(Phaser.Math.Between(64, 736), Phaser.Math.Between(64, 536), 'enemy');
    this.enemies.create(Phaser.Math.Between(64, 736), Phaser.Math.Between(64, 536), 'enemy');
    this.enemies.create(Phaser.Math.Between(64, 736), Phaser.Math.Between(64, 536), 'enemy');

    Phaser.Actions.Call(this.enemies.getChildren(), function (enemy) {
      enemy.anims.play('enemy_idle');
      enemy.body.setSize(32, 48);
    }, this);

    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.anims.play('player_idle');
    this.player.body.setSize(32, 32);
    this.player.body.setOffset(16, 24);
    this.player.body.onWorldBounds = true;
    this.player.body.setCollideWorldBounds(true);

    this.bowPicked = false;
    this.keyPicked = false;
    this.isDamaged = false;
    this.damageTimer = 0.0;
    this.damagedTime = 1000;
    this.healthPoints = 3;

    // Physics
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.door, this.onCollisionPlayerDoor, null, this);
    this.physics.add.collider(this.player, this.bow, this.onCollisionPlayerBow, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onCollisionPlayerEnemy, null, this);
    this.physics.add.collider(this.arrows, this.walls, this.onCollisionArrowWall, null, this);
    this.physics.add.collider(this.arrows, this.enemies, this.onCollisionArrowEnemy, null, this);
    this.physics.world.on('worldbounds', this.onWorldBounds, this);

    // UI
    this.healthText = this.add.text(16, 16, 'HEALTH: 3', {
      font: "24px Arial",
      fill: "#ff8000",
      align: "left"
    })
  }

  update(time, delta) {
    this.handleInput(delta);

    if (this.isDamaged) {
      this.damageTimer += delta;
      if (this.damageTimer > this.damagedTime) {
        this.damageTimer = 0.0;
        this.isDamaged = false;
        this.player.setAlpha(1.0);
      }
    }
  }

  handleInput(delta) {
    if (this.controller.up.isDown) {
      this.player.setVelocityY(-10 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk') {
        this.player.anims.play('player_walk');
      }
    }
    else if (this.controller.down.isDown) {
      this.player.setVelocityY(10 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk') {
        this.player.anims.play('player_walk');
      }
    }

    if (this.controller.left.isDown) {
      this.player.setFlipX(false);
      this.player.setVelocityX(-10 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk') {
        this.player.anims.play('player_walk');
      }
    }
    else if (this.controller.right.isDown) {
      this.player.setFlipX(true);
      this.player.setVelocityX(10 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk') {
        this.player.anims.play('player_walk');
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

    if (Phaser.Input.Keyboard.JustDown(this.controller.space)) {
      if (this.bowPicked) {
        this.shootArrow(delta);
      }
    }
  }

  shootArrow(delta) {

    if (this.player.body.facing == Phaser.Physics.Arcade.FACING_RIGHT) {
      var arrow = this.arrows.create(this.player.x, this.player.y, "arrowh");
      arrow.body.setVelocityX(30 * delta);
    }
    else if (this.player.body.facing == Phaser.Physics.Arcade.FACING_LEFT) {
      var arrow = this.arrows.create(this.player.x, this.player.y, "arrowh");
      arrow.setFlipX(true);
      arrow.body.setVelocityX(-30 * delta);
    }
    else if (this.player.body.facing == Phaser.Physics.Arcade.FACING_UP) {
      var arrow = this.arrows.create(this.player.x, this.player.y, "arrowv");
      arrow.body.setVelocityY(-30 * delta);
    }
    else if (this.player.body.facing == Phaser.Physics.Arcade.FACING_DOWN) {
      var arrow = this.arrows.create(this.player.x, this.player.y, "arrowv");
      arrow.setFlipY(true);
      arrow.body.setVelocityY(30 * delta);
    }

    this.shootSound.play();

  }

  spawnKey() {
    this.key = this.physics.add.staticImage(
      Phaser.Math.Between(48, 752), Phaser.Math.Between(48, 552), 'key');
    this.physics.add.collider(this.player, this.key, this.onCollisionPlayerKey, null, this);
  }

  onCollisionPlayerDoor(player, door) {
    if (this.keyPicked) {
      door.destroy();
      this.openSound.play();
    }
  }

  onCollisionPlayerBow(player, bow) {
    bow.destroy();
    this.bowPicked = true;
    this.itemSound.play();
  }

  onCollisionPlayerKey(player, key) {
    key.destroy();
    this.keyPicked = true;
    this.pickSound.play();
  }

  onCollisionPlayerEnemy(player, enemy) {

    if (!this.isDamaged) {
      this.player.setAlpha(0.5);
      this.isDamaged = true;
      this.healthPoints--;
      this.healthText.setText('HEALTH: ' + this.healthPoints);
      this.hurtSound.play();

      if (this.healthPoints <= 0) {
        this.music.stop();
        this.deathSound.play();
        this.scene.start('lose');
      }

    }
  }

  onCollisionArrowWall(arrow, wall) {
    this.arrows.remove(arrow, true, true);
    this.missSound.play();
  }

  onCollisionArrowEnemy(arrow, enemy) {

    this.arrows.remove(arrow, true, true);
    this.enemies.remove(enemy, true, true);
    this.hitSound.play();

    if (this.enemies.getLength() == 0) {
      this.spawnKey();
      this.solvedSound.play();
    }

  }

  onWorldBounds() {
    this.music.stop();
    this.scene.start('win');
  }
}