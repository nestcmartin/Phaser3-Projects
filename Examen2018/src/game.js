export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  preload() {

    this.load.image('block', './assets/block.png');
    this.load.audio('spawn', './assets/spawn.wav');
    this.load.audio('despawn', './assets/despawn.wav');
    this.load.audio('select', './assets/select.wav');
    this.load.audio('impulse', './assets/impulse.wav');

  }

  create() {

    this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, true, true);

    this.blocks = this.add.group();
    this.currentBlock = this.blocks.getLength();

    this.addKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.selectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.deleteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.impulseUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.impulseLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.impulseDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.impulseRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    this.spawnSound = this.sound.add('spawn');
    this.despawnSound = this.sound.add('despawn');
    this.selectSound = this.sound.add('select');
    this.impulseSound = this.sound.add('impulse');
  }

  update(time, delta) {

    if (Phaser.Input.Keyboard.JustDown(this.addKey)) {
      this.addBlock();
    }

    if (Phaser.Input.Keyboard.JustDown(this.selectKey)) {
      this.selectBlock();
    }

    if (Phaser.Input.Keyboard.JustDown(this.deleteKey)) {
      this.deleteBlock();
    }

    if (Phaser.Input.Keyboard.JustDown(this.impulseUpKey)) {
      this.impulseBlock(0, -0.1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.impulseLeftKey)) {
      this.impulseBlock(-0.1, 0);    
    }

    if (Phaser.Input.Keyboard.JustDown(this.impulseDownKey)) {
      this.impulseBlock(0, 0.1);    
    }

    if (Phaser.Input.Keyboard.JustDown(this.impulseRightKey)) {
      this.impulseBlock(0.1, 0);
    }
    
  }

  addBlock() {
    var block = this.matter.add.sprite(
      Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), 'block');
    block.setVelocity(
      Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
    block.setBounce(1);

    this.blocks.add(block);
    console.log('Added block (' + this.blocks.getLength() + ')');

    if (this.blocks.getLength() == 1) {
      this.selectBlock();
    }

    this.spawnSound.play();

  }

  selectBlock() {

    if (this.blocks.getLength() == 0) return;

    this.blocks.getChildren()[this.currentBlock].clearTint();
    this.currentBlock = (this.currentBlock + 1) % this.blocks.getLength();
    this.blocks.getChildren()[this.currentBlock].setTintFill(0x00ff00);
    console.log('Current block is ' + this.currentBlock);

    this.selectSound.play();

  }

  deleteBlock() {

    if (this.blocks.getLength() == 0) return;

    this.blocks.getChildren()[this.currentBlock].clearTint();
    this.blocks.remove(this.blocks.getChildren()[this.currentBlock], true, true);
    console.log('Deleted block (' + this.blocks.getLength() + ')');

    if (this.blocks.getLength() > 0) {
      this.currentBlock = (this.currentBlock + 1) % this.blocks.getLength();
      this.blocks.getChildren()[this.currentBlock].setTintFill(0x00ff00);
      console.log('Current block is ' + this.currentBlock);
    }

    this.despawnSound.play();

  }

  impulseBlock(forceX, forceY) {

    if (this.blocks.getLength() == 0) return;

    this.blocks.getChildren()[this.currentBlock].applyForce({ x: forceX, y: forceY });

    this.impulseSound.play();
  
  }
}