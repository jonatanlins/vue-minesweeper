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
        <square 
          v-for="(square, x) in row" :key="x"
          v-bind.sync="square"
          @click.native="play(x, y)"
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
    squares: Array(16).fill(Array(30).fill({ open: false })),
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
      bombs.splice(startY * 30 + startX, 1)
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
          return { open: false, value: number }
        } else {
          return square
        }
      }))
      console.log(this.squares)

      this.timer = setInterval(() => this.time++, 1000)
      this.discover(startX, startY)
    },
    discover (x, y) {
      const open = (x, y) => {
        if(!this.squares[y][x].open && x >= 0 && x < 30 && y >= 0 && y < 16) {
          this.squares[y][x].open = true
          
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
        open: false
      })))
      this.started = this.gameOver = false
    },
    play (x, y) {
      if(this.started) {
        this.discover(x, y)
      } else if (!this.gameOver) {
        this.start(x, y)
      }
    }
  },
  components: {
    Square: require('./Square').default,
  }
}
</script>

<style lang="sass" scoped>
  @import 'style'
</style>
