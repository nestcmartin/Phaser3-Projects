export default class Lose extends Phaser.Scene {
    constructor() {
        super({ key: 'lose' });
    }

    preload() {
        this.load.image('lose', './assets/lose.png');
    }

    create() {
        this.controller = this.input.keyboard.createCursorKeys();

        this.add.image(400, 300, 'lose');

        this.tryAgainText = this.add.text(250, 400, 'Press SPACE to TRY AGAIN', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        });
    }

    update(time, delta) {
        if (this.controller.space.isDown) {
            this.scene.start('game');
        }
    }
}