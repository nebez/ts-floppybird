<img src="screencap.png" align="right" width="250">

# [play floppy bird](https://nebezb.com/ts-floppybird/)

If you missed the Flappy Bird hype, here's your chance to try the best vintage knockoff. (again...)

**Features**

* 🎉 same as the regular [floppybird project](https://github.com/nebez/floppybird/),
* 👷‍♂️ but it's been poorly rewritten in typescript because I was bored!

Enjoy.

### Development

It's been setup to work for me locally using a combination of `nix` + `direnv` on Darwin. If you use both, you're in luck.

* `direnv allow`
* `npm ci`
* `./bin/dev-compile`
* `./bin/serve`
* browse to [`http://127.0.0.1:8080`](http://127.0.0.1:8080)

If you don't have `nix` + `direnv`, you're honestly still in luck because all you need is npm.

* get npm
* and then do everything else mentioned aboved, starting with `npm ci`

### Notice

The assets powering the visual element of the game have all been extracted directly from the Flappy Bird android game. I do not own the assets, nor do I have explicit permission to use them from their creator. They are the work and copyright of original creator Dong Nguyen and .GEARS games (http://www.dotgears.com/).

I took this Tweet (https://twitter.com/dongatory/status/431060041009856512 / http://i.imgur.com/AcyWyqf.png) by Dong Nguyen, the creator of the game, as an open invitation to reuse the game concept and assets in an open source project. There is no intention to steal the game, monetize it, or claim it as my own.

If the copyright holder would like for the assets to be removed, please open an issue to start the conversation.
