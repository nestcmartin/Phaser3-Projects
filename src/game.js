export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.image("room", "./assets/room.png",);
    this.load.image("wall1", "./assets/wall_1.png",);
    this.load.image("wall2", "./assets/wall_2.png",);
    this.load.image("wall3", "./assets/wall_3.png",);

    this.load.spritesheet("player", "./assets/zelda.png", { frameWidth: 24, frameHeight: 32 });
    this.load.image("bow", "./assets/favicon.png",);
    this.load.image("enemy", "./assets/enemy.png",);
    this.load.image("door", "./assets/door.png",);
  }

  create() {

    this.background = this.add.image(0, 0, "room");
    this.background.setOrigin(0);

    this.walls = this.physics.add.staticGroup();
    this.walls.create(0, 0, "wall1").setOrigin(0, 0).setVisible(false).refreshBody();
    this.walls.create(0, 387, "wall1").setOrigin(0, 0).setVisible(false).refreshBody();
    this.walls.create(0, 0, "wall2").setOrigin(0, 0).setVisible(false).refreshBody();
    this.walls.create(0, 576, "wall2").setOrigin(0, 0).setVisible(false).refreshBody();
    this.walls.create(896, 0, "wall3").setOrigin(0, 0).setVisible(false).refreshBody();

    this.door = this.physics.add.staticImage(93, 356, "door")

    this.enemies = this.physics.add.staticGroup();
    this.enemies.create(210, 360, "enemy");
    this.enemies.create(800, 210, "enemy");
    this.enemies.create(800, 490, "enemy");

    this.bow = this.physics.add.sprite(600, 200, "bow");

    this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "player", 2);
    this.player.body.setSize(20, 16);
    this.player.body.offset.y = 16;

    this.player.setScale(3.5);
    this.player.body.collideWorldBounds = true;

    this.setAnimations();
    this.setPhysics();

    this.cursor = this.input.keyboard.createCursorKeys();

    this.health = 100;
    this.hasBow = false;
    this.numEnemies = 3;
  }

  setAnimations() {
    this.anims.create({
      key: 'player_idle_up',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [2]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_idle_down',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [77]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_idle_right',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [36]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_idle_left',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [12]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_walk_up',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
          48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_walk_down',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
          72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_walk_left',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
          84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95]
      }),
      repeat: -1,
      frameRate: 30
    });

    this.anims.create({
      key: 'player_walk_right',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
          60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]
      }),
      repeat: -1,
      frameRate: 30
    });
  }

  setPhysics() {
    this.physics.add.overlap(this.player, this.bow, this.getWeapon, null, this);
    this.physics.add.collider(this.player, this.enemies, this.damagePlayer, null, this);
    this.physics.add.collider(this.player, this.door, this.checkRoom, null, this);
    this.physics.add.collider(this.player, this.walls);
  }


  update(time, delta) {
    this.handleInput(delta);
  }

  handleInput(delta) {
    if (this.cursor.right.isDown) {
      this.player.setVelocity(0, 0);
      this.player.setVelocityX(25 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk_right') this.player.anims.play('player_walk_right');
    }
    else if (this.cursor.left.isDown) {
      this.player.setVelocity(0, 0);
      this.player.setVelocityX(-25 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk_left') this.player.anims.play('player_walk_left');
    }
    else if (this.cursor.down.isDown) {
      this.player.setVelocity(0, 0);
      this.player.setVelocityY(25 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk_down') this.player.anims.play('player_walk_down');
    }
    else if (this.cursor.up.isDown) {
      this.player.setVelocity(0, 0);
      this.player.setVelocityY(-25 * delta);
      if (this.player.anims.getCurrentKey() != 'player_walk_up') this.player.anims.play('player_walk_up');
    }
    else if (Phaser.Input.Keyboard.JustDown(this.cursor.space)) {
      this.player.setVelocity(0, 0);
      if (this.hasWeapon()) console.log("payun payun");
    }
    else if (Phaser.Input.Keyboard.JustUp(this.cursor.up)) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('player_idle_up');
    }
    else if (Phaser.Input.Keyboard.JustUp(this.cursor.down)) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('player_idle_down');
    }
    else if (Phaser.Input.Keyboard.JustUp(this.cursor.right)) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('player_idle_left');
    }
    else if (Phaser.Input.Keyboard.JustUp(this.cursor.left)) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('player_idle_right');
    }
  }


  hasWeapon() {
    return this.hasBow;
  }

  hasKey() {
    return this.numEnemies <= 0;
  }

  getWeapon(player, bow) {
    bow.disableBody(true, true);
    this.hasBow = true;
  }

  damagePlayer(player, enemy) {
    if (this.hasWeapon()) {
      enemy.disableBody(true, true);
      this.numEnemies--;
    }
    else {
      this.health--;
    }
  }

  checkRoom(player, door) {
    if (this.hasKey()) {
      console.log("Game over!");
    }
    else {
      console.log("Enemies left: " + this.numEnemies);
    }
  }
}