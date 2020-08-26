export default class Win extends Phaser.Scene {
    constructor() {
        super({ key: 'win' });
    }

    preload() {
        this.load.image('win', './assets/win.png');  
        this.load.audio('victory', './assets/victory.mp3');  
    }

    create() {
        this.controller = this.input.keyboard.createCursorKeys();

        this.add.image(400, 300, 'win');
        var music = this.sound.add('victory');
        music.play();
    }
    
    update(time, delta) {
        if (this.controller.space.isDown) {
            this.scene.start('game');
        }
    }
}