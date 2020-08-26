export default class Win extends Phaser.Scene {
    constructor() {
        super({ key: 'win' });
    }

    preload() {
        this.load.image('win', './assets/win.png');  
        this.load.audio('victory', './assets/victory.mp3');  
    }

    create() {
        this.add.image(400, 300, 'win');
        var music = this.sound.add('victory');
        music.play();
    }
}