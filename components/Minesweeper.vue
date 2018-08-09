<template>
  <div class="game-table" @click.right.prevent="() => {}">
    <div class="header">
      <span>
        <icon class="icon" name="bomb"/>
        {{ bombs }}
      </span>

      <button class="reset-button" @click="reset">RESET</button>

      <span>
        {{ formattedTime }}
        <icon class="icon" name="clock"/>
      </span>
    </div>

    <div class="grid">
      <div class="row" v-for="(row, y) in squares" :key="y">
        <div v-for="({ state, value }, x) in row" :key="x"
          :class="[ 'square', state === 'open' ? `value-${value}` : state]"
          @click.right.prevent="flag(x, y)"
          @click.left="play(x, y)"
        >
          <icon v-if="state === 'flag'" name="flag"/>

          <template v-if="state === 'open'">
            {{ (value > 0) ? value : '' }}
            <icon v-if="value === 'bomb'" name="bomb"/>
          </template>

        </div>
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
      return (Math.floor(this.time / 60) + ':' +
        ('0' + (this.time % 60)).slice(-2))
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
$black: #222;
$medium: 600px;
$radius: .25em;
$thickness: 2px;

.game-table {
  border: $thickness solid $black;
  border-radius: $radius;
  padding: .5em;
  user-select: none;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: .5em;

  & > * {
    border: $thickness solid $black;
    border-radius: $radius;
    font-size: 1.3em;
    padding: .2em .5em;
  }
}

button,
.btn {
  border: $thickness solid $black;
  background-color: transparent;
  transition: all .2s ease;
  color: $black;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 .5em rgba(0, 0, 0, .8);
  }

  &:active {
    transform: none;
    box-shadow: none;
  }
}

.grid {
  display: flex;
  flex-direction: row;

  @media (min-width: $medium) {
    flex-direction: column;
  }

  .row {
    display: flex;
    flex: 0 0 (100% / 16);
    flex-direction: column;

    @media (min-width: $medium) {
      flex-direction: row;
    }

    .square {
      display: flex;
      flex: 0 0 (90% / 30);
      align-items: center;
      justify-content: center;
      min-height: 1em;
      font-size: 100%;
      border-radius: $radius;
      box-sizing: border-box;
      margin: 5%;

      @media (min-width: $medium) {
        margin: (5% / 30);
      }

      &:before {
        content: '';
        float: left;
        padding-top: 100%;
      }
      
      &.closed {
        @extend .btn;
        border: $thickness solid $black;
      }

      &.flag {}

      &.value-bomb {}
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
