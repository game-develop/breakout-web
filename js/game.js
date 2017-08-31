(function(){
    const GAME_WIDTH = 600;
    const GAME_HEIGHT = 400;

    var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update
    });

    var ball = null,
        paddle = null,
        bricks = null,
        brickInfo = null,

        scoreText = null,
        score = 0,
        lives = 3,
        livesText = null,
        lifeLostText = null,
        textStyle = { font: '18px Arial', fill: '#0095DD' },
        playing = false,
        startButton = null;

    function preload() {
        game.stage.backgroundColor = '#eee';

        //game.load.image('ball', 'images/ball.png');
        game.load.image('paddle', 'images/paddle.png');
        game.load.image('brick', 'images/brick.png');
        game.load.spritesheet('ball', 'images/wobble.png', 20, 20);
        game.load.spritesheet('button', 'images/button.png', 120, 40);
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.checkCollision.down = false;

        ball = game.add.sprite(GAME_WIDTH*0.5, GAME_HEIGHT-25, 'ball');
        ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
        ball.anchor.set(0.5);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        //ball.body.velocity.set(150, 150);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);
        ball.checkWorldBounds = true;
        ball.events.onOutOfBounds.add(ballLeaveScreen, this);


        paddle = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'paddle');
        paddle.anchor.set(0.5, 0.5);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        paddle.body.collideWorldBounds = true;
        paddle.body.bounce.set(1);
        paddle.body.immovable = true;


        initBricks();

        scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
        livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
        livesText.anchor.set(1,0);
        lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', textStyle);
        lifeLostText.anchor.set(0.5);
        lifeLostText.visible = false;

        startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
        startButton.anchor.set(0.5);
    }

    function update() {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle);
        game.physics.arcade.collide(ball, bricks, ballHitBrick);

        if (playing) {
            paddle.x = game.input.x || GAME_WIDTH / 2;
        }
    }

    function initBricks() {
        brickInfo = {
            width: 50,
            height: 20,
            count: {
                row: 7,
                col: 3
            },
            offset: {
                top: 50,
                left: 100
            },
            padding: 10
        };

        bricks = game.add.group();

        for(var c = 0; c < brickInfo.count.col; c++) {
            for(var r = 0; r < brickInfo.count.row; r++) {
                var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
                var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;

                var newBrick = game.add.sprite(brickX, brickY, 'brick');
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                newBrick.body.bounce.set(1);

                bricks.add(newBrick);
            }
        }
    }

    function ballHitBrick(ball, brick) {
        var killTween = game.add.tween(brick.scale);
        killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
        killTween.onComplete.addOnce(function(){
            brick.kill();
        }, this);
        killTween.start();

        score += 10;
        scoreText.setText('Points: '+score);

        var count_alive = 0;
        for (var i = 0; i < bricks.children.length; i++) {
            if (bricks.children[i].alive == true) {
                count_alive++;
            }
        }
        if (count_alive == 0) {
            alert('You won the game, congratulations!');
            location.reload();
        }
    }

    function ballLeaveScreen() {
        lives--;
        if(lives) {
            livesText.setText('Lives: '+lives);
            lifeLostText.visible = true;
            ball.reset(game.world.width*0.5, game.world.height-25);
            paddle.reset(game.world.width*0.5, game.world.height-5);
            game.input.onDown.addOnce(function(){
                lifeLostText.visible = false;
                ball.body.velocity.set(150, -150);
            }, this);
        }
        else {
            alert('You lost, game over!');
            location.reload();
        }
    }

    function ballHitPaddle(ball, paddle) {
        ball.animations.play('wobble');
        ball.body.velocity.x = -1*5*(paddle.x-ball.x);
    }

    function startGame() {
        startButton.destroy();
        ball.body.velocity.set(150, -150);
        playing = true;
    }
})();