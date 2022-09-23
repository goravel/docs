<template>
  <div class="container">
    <!-- sidebar-top -->
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-4978322804450032"
      data-ad-slot="9393443865"
      data-ad-format="auto"
      data-full-width-responsive="true"
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
