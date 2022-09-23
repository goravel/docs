<script setup>
import ParentLayout from "@vuepress/theme-default/layouts/Layout.vue";
</script>

<template>
  <ParentLayout>
    <template #sidebar-bottom>
      <sidebar-top />
    </template>
  </ParentLayout>
</template>

<style lang="css">
.my-footer {
  text-align: center;
}
</style>
