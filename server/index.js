// Cloudflare Workers entrypoint for the static portfolio assets.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
