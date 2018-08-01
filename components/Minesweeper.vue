<template>
  <div class="game-table" @click.right.prevent="() => {}">
    <div class="header">
      <span class="bombs"><i/>{{ bombs }}</span>
      <button class="reset-button" @click="reset"> RESET </button>
      <span class="time">{{ formattedTime }}<i/></span>
    </div>

    <div class="grid">
      <div class="row" v-for="(row, y) in squares" :key="y">
        <div
          v-for="({ state, value }, x) in row" :key="x"
          :class="[ 'square', state === 'open' ? `value-${value}` : state]"
          @click.right.prevent="flag(x, y)"
          @click.left="play(x, y)"
          v-text="(value > 0 && state === 'open') ? value : ''"
        />
      </div>
    </div>

    <div :class="{ 'game-status': true, gameOver, winner }"/>
  </div>
</template>

<script>
export default {
  data: () => ({
    bombs: 99,
    time: 0,
    timer: null,
    squares: Array(16).fill(Array(30).fill({ state: 'closed' })),
    started: false,
    gameOver: false,
    points: 0,
    winner: false
  }),
  mounted () {
    this.reset()
  },
  computed: {
    formattedTime () {
      return `${Math.floor(this.time / 60)}:${('0' + (this.time % 60)).slice(-2)}`
    }
  },
  methods: {
    start (startX, startY) {
      this.started = true

      let bombs = Array(480).fill(null).map((value, index) => ({
        x: (index % 30),
        y: Math.floor(index / 30)
      }))
      bombs.splice(startY * 30 + startX + 29, 3)
      bombs.splice(startY * 30 + startX - 1, 3)
      bombs.splice(startY * 30 + startX - 31, 3)
      for (let i = 0; i < 99; i++) {
        const index = Math.floor(Math.random() * bombs.length)
        const bomb = bombs.splice(index, 1)[0]
        this.squares[bomb.y][bomb.x].value = 'bomb'
      }

      const checkForBomb = (x, y) => {
        if (x >= 0 && x < 30 && y >= 0 && y < 16) {
          return this.squares[y][x].value === 'bomb'
        } else return false
      }
      this.squares = this.squares.map((row, y) => row.map((square, x) => {
        if (square.value !== 'bomb') {
          let number = 0
          if (checkForBomb(x-1, y-1)) number++
          if (checkForBomb(x,   y-1)) number++
          if (checkForBomb(x+1, y-1)) number++
          if (checkForBomb(x+1, y  )) number++
          if (checkForBomb(x+1, y+1)) number++
          if (checkForBomb(x,   y+1)) number++
          if (checkForBomb(x-1, y+1)) number++
          if (checkForBomb(x-1, y  )) number++
          return { state: 'closed', value: number }
        } else {
          return square
        }
      }))

      this.timer = setInterval(() => this.time++, 1000)
      this.discover(startX, startY)
    },
    flag (x, y) {
      if (this.started) {
        if (this.squares[y][x].state === 'closed') {
          this.squares[y][x].state = 'flag'
          this.bombs--
        } else if (this.squares[y][x].state === 'flag') {
          this.squares[y][x].state = 'closed'
          this.bombs++
        }
      }
    },
    discover (x, y) {
      const open = (x, y) => {
        if(
          x >= 0 && x < 30 && y >= 0 && y < 16 &&
          this.squares[y][x].state !== 'open'
        ) {
          this.squares[y][x].state = 'open'
          
          if(this.squares[y][x].value === 0) {
            open(x-1, y-1); open(x,   y-1); open(x+1, y-1)
            open(x-1, y  );                 open(x+1, y  )
            open(x-1, y+1); open(x,   y+1); open(x+1, y+1)
          }
        }
      }
      open(x, y)

      if (this.squares[y][x].value === 'bomb') this.end()
      else this.points++

      if (this.points === 381) this.win()
    },
    end () {
      clearInterval(this.timer)
      this.started = false
      this.gameOver = true
    },
    win () {
      clearInterval(this.timer)
      this.started = false
      this.winner = true
    },
    reset() {
      clearInterval(this.timer)
      this.time = 0
      this.squares = this.squares.map(row => row.map(() => ({
        value: 0,
        state: 'closed'
      })))
      this.started = this.gameOver = this.winner = false
    },
    play (x, y) {
      if (this.squares[y][x].state === 'closed') {
        if (this.started) {
          this.discover(x, y)
        } else if (!this.gameOver) {
          this.start(x, y)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.game-table {
  border: .1em solid #222;
  border-radius: .15em;
  padding: .5em;
  user-select: none;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: .5em;

  .bombs,
  .time,
  .reset-button {
    background-color: transparent;
    border: .1em solid #222;
    border-radius: .15em;
    display: flex;
    align-items: center;
    font-size: 1.3em;
    padding: .2em .5em;
  }
  
  .bombs {
    i {
      position: relative;
      display: inline-block;
      background-color: #222;
      border-radius: 50%;
      margin: .25em .5em 0 0;
      width: .75em;
      height: .75em;

      &:before {
        content: '';
        display: inline-block;
        background-color: #222;
        width: .3em;
        height: .3em;
        position: absolute;
        border-radius: .05em;
        left: .23em;
        top: -.08em;
      }

      &:after {
        content: '';
        display: inline-block;
        border: .05em solid transparent;
        border-top-color: #222;
        transform: rotate(-45deg);
        border-radius: 50%;
        width: .4em;
        height: .4em;
        position: absolute;
        left: .35em;
        top: -.25em;
      }
    }
  }
  
  .time {

    i {
      display: inline-block;
      position: relative;
      border: .1em solid #222;
      border-radius: 50%;
      width: 1em;
      height: 1em;
      margin-left: .5em;

      &:before {
        content: '';
        position: absolute;
        display: inline-block;
        height: .3em;
        width: .1em;
        border-radius: 1em;
        background-color: #222;
        left: .35em;
        top: .15em;
      }

      &:after {
        content: '';
        position: absolute;
        display: inline-block;
        height: .35em;
        width: .1em;
        border-radius: .05em;
        background-color: #222;
        left: .47em;
        top: .34em;
        transform: rotate(-45deg);
      }
    }
  }
  
  .reset-button {
    transition: all .2s ease;
    cursor: pointer;
    outline: none;

    &:hover,
    &:focus {
      transform: translate3D(-.2em, -.2em, 1em);
      box-shadow: .2em .2em .2em rgba(0, 0, 0, .5);
    }

    &:active {
      transform: none;
      box-shadow: none;
    }
  }
}

.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  @media (min-width: 500px) {
    flex-direction: column;
  }

  .row {
    display: flex;
    flex: 1 1 auto;

    .square {
      display: inline-block;
      width: (100% / 30);
      height: 1em;
      
      &.closed {
        background-color: grey;
      }

      &.flag {
        background-color: blue;
      }

      &.value-bomb {
        background-color: red;
      }
    }
  }
}

.game-status {
  display: none;
  position: absolute;


  &.gameOver {
    &:before {
      content: 'GAME OVER'
    }
  }
  
  &.winner {
    &:before {
      content: 'Você venceu!'
    }
  }
}
</style>
