import { d as ensure_array_like, f as attr, e as escape_html } from "../../chunks/renderer.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import "@tauri-apps/plugin-fs";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let games = [
      {
        id: "repo",
        name: "R.E.P.O",
        slug: "repo",
        banner: "https://cdn2.steamgriddb.com/thumb/9ca4292f040b141fd182d5028f27e503.jpg"
      },
      {
        id: "subnautica",
        name: "Subnautica",
        slug: "subnautica",
        banner: "https://cdn2.steamgriddb.com/thumb/ab85e1cac497d5d96978ca6a6a58a2ee.jpg"
      },
      {
        id: "peak",
        name: "PEAK",
        slug: "peak",
        banner: "https://cdn2.steamgriddb.com/thumb/b53b8b48c4b228b070851d52800bb9e1.jpg"
      },
      {
        id: "lethal-company",
        name: "Lethal Company",
        slug: "lethal-company",
        banner: "https://cdn2.steamgriddb.com/thumb/196a5cad7254e133fbb226989034e460.jpg"
      },
      {
        id: "valheim",
        name: "Valheim",
        slug: "valheim",
        banner: "https://cdn2.steamgriddb.com/thumb/15bae9fa92cfa7982d794811b05162c9.jpg"
      },
      {
        id: "hollow-knight-silksong",
        name: "Hollow Knight: Silksong",
        slug: "hollow-knight-silksong",
        banner: "https://cdn2.steamgriddb.com/thumb/48b505846f30602aaff7e2d336720e6d.jpg"
      },
      {
        id: "muck",
        name: "Muck",
        slug: "muck",
        banner: "https://cdn2.steamgriddb.com/thumb/dc823bed5df671ab204b95fe29f77ef5.jpg"
      },
      {
        id: "megabonk",
        name: "Megabonk",
        slug: "megabonk",
        banner: "https://cdn2.steamgriddb.com/thumb/cc7c509964d8af4760e3ef8b64e2382a.jpg"
      },
      {
        id: "subnautica-below-zero",
        name: "Subnautica: Below Zero",
        slug: "subnautica-below-zero",
        banner: "https://cdn2.steamgriddb.com/thumb/e47883e8ec16860ea2385727a6824c28.jpg"
      },
      {
        id: "sons-of-the-forest",
        name: "Sons of the Forest",
        slug: "sons-of-the-forest",
        banner: "https://cdn2.steamgriddb.com/thumb/44718cc7141c5078d668995d5165d403.jpg"
      },
      {
        id: "crab-game",
        name: "Crab Game",
        slug: "crab-game",
        banner: "https://cdn2.steamgriddb.com/thumb/3dd2b1e105c4da7735384dfca5522500.jpg"
      },
      {
        id: "amoung-us",
        name: "Amoung Us",
        slug: "amoung-us",
        banner: "https://cdn2.steamgriddb.com/thumb/42acab51cf2973d1b174ec59f11c9795.jpg"
      },
      {
        id: "rounds",
        name: "ROUNDS",
        slug: "rounds",
        banner: "https://cdn2.steamgriddb.com/thumb/87ed2956e624698d4b6abfc53c423f65.jpg"
      },
      {
        id: "content-warning",
        name: "Content Warning",
        slug: "content-warning",
        banner: "https://cdn2.steamgriddb.com/thumb/f8aba25c0d98aec777331af10b69a36e.jpg"
      },
      {
        id: "ultrakill",
        name: "ULTRAKILL",
        slug: "ultrakill",
        banner: "https://cdn2.steamgriddb.com/thumb/4c1b274e8befa9cbcd35ae8bdd5f1085.jpg"
      }
    ];
    $$renderer2.push(`<div class="games-view svelte-1uha8ag"><h1 class="view-title svelte-1uha8ag">My Games</h1> <div class="games-grid svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(games);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let game = each_array[$$index];
      $$renderer2.push(`<button class="game-card svelte-1uha8ag"><div class="banner-box svelte-1uha8ag"><img${attr("src", game.banner)}${attr("alt", game.name)} class="svelte-1uha8ag"/></div> <div class="game-info svelte-1uha8ag"><span class="game-name svelte-1uha8ag">${escape_html(game.name)}</span></div></button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
