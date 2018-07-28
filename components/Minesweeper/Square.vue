<template class="square">
  <button v-if="!open" class="square-button"/>

  <div v-else-if="value === 'bomb'" class="square-bomb"/>

  <div v-else :class="`square-number number-${value}`">
    {{ value === 0 ? '' : value }}
  </div>
</template>

<script>
export default {
  props: {
    open: Boolean,
    value: [String, Number]
  }
}
</script>
