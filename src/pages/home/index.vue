<template>
  <div class="text">
    page home
    <button @click="click">跳转index</button>
    <div class="block-color" :style="{ backgroundColor: color }"></div>
    <button @click="checkColor">改变颜色</button>
  </div>
</template>

<script>
import Vue from 'vue';
export default {
  computed: {
    color() {
      return this.$store.state.home.color;
    },
  },
  methods: {
    click() {
      this.$router.push('/');
    },
    checkColor() {
      this.$store.dispatch('home/getData');
    },
  },
};
</script>

<style lang="less">
.text {
  color: red;
}
.block-color {
  width: 80px;
  height: 80px;
}
</style>
