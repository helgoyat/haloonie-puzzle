<script setup lang="ts">
defineProps({
  selected: Boolean,
});
</script>

<template>
  <div
    class="w-8 h-8 outline rounded-full hover:cursor-pointer shadow"
    :class="selected ? 'bg-transparent outline-4 outline-blue-400' : 'bg-blue-400 outline-0'"></div>
</template>
