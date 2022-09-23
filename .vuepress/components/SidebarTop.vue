<template>
  <div class="container" style="width: 260px; margin: 0 auto">
    <!-- sidebar-top -->
    <ins
      class="adsbygoogle"
      style="display: inline-block; width: 260px; height: 160px"
      data-ad-client="ca-pub-4978322804450032"
      data-ad-slot="9393443865"
    ></ins>
  </div>
</template>

<script>
export default {
  name: "SiderbarTop",
  mounted() {
    this.adsenseAddLoad();
  },
  methods: {
    adsenseAddLoad() {
      let inlineScript = document.createElement("script");
      // inlineScript.type = "text/javascript";
      inlineScript.text = "(adsbygoogle = window.adsbygoogle || []).push({});";
      document.getElementsByTagName("body")[0].appendChild(inlineScript);
    },
  },
};
</script>
