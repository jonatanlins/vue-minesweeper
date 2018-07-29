<template>
  <div class="game-table">
    <div class="header">
      <span>{{ bombs }}</span>
      <button
        :class="{ 'reset-button': true, 'game-over': gameOver }"
        @click="reset"
      />
      <span>{{ time }}</span>
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
    gameOver: false
  }),
  mounted () {
    this.reset()
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
        } else if (this.squares[y][x].state === 'flag') {
          this.squares[y][x].state = 'closed'
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

      if (this.squares[y][x].value === 'bomb') {
        this.end()
      }
    },
    end () {
      clearInterval(this.timer)
      this.started = false
      this.gameOver = true
    },
    reset() {
      this.squares = this.squares.map(row => row.map(() => ({
        value: 0,
        state: 'closed'
      })))
      this.started = this.gameOver = false
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
.game-table {}

.square {
  display: inline-block;
  width: 1em;
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

.reset-button {
  background-color: transparent;
  border: 1px solid black;
  border-radius: 2px;

  &:before {
    content: ':)'
  }
  
  &.game-over {
    color: red;
  
    &:before {
      content: ':('
    }
  }
}
</style>
