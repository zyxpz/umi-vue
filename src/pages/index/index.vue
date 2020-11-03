<template>
  <div class="index-text">
    page index
    <button @click="click">跳转home</button>
    <div>{{ count }}</div>
    <button @click="addClick">+1</button>
    <button @click="reduceClick">-1</button>
  </div>
</template>

<script>
import Vue from 'vue';
export default {
  computed: {
    count() {
      return this.$store.state.index.count;
    },
  },
  methods: {
    click() {
      this.$router.push('/home');
    },
    addClick() {
      this.$store.commit('index/add');
    },
    reduceClick() {
      this.$store.commit('index/reduce');
    },
  },
};
</script>

<style lang="less">
.index-text {
  color: blue;
}
</style>
