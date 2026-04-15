import { f as ensure_array_like, a as attr, e as escape_html } from "../../chunks/renderer.js";
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
        banner: "https://cdn2.steamgriddb.com/thumb/9ca4292f040b141fd182d5028f27e503.jpg",
        executablePath: "D:\\SteamLibrary\\steamapps\\common\\REPO\\REPO.exe"
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
        banner: "https://cdn2.steamgriddb.com/thumb/dc823bed5df671ab204b95fe29f77ef5.jpg",
        executablePath: "D:\\SteamLibrary\\steamapps\\common\\Muck\\muck.exe"
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
      },
      {
        id: "9-kings",
        name: "9 Kings",
        slug: "9-kings",
        banner: "https://cdn2.steamgriddb.com/thumb/ef2da7763876c3d303a10e6bcd845e15.jpg"
      },
      {
        id: "a-gentlemens-dispute",
        name: "A Gentlemen's Dispute",
        slug: "a-gentlemens-dispute",
        banner: "https://cdn2.steamgriddb.com/thumb/5c832787dabc5fa1c1bba25901a13aee.jpg"
      },
      {
        id: "aeruta",
        name: "Aeruta",
        slug: "aeruta",
        banner: "https://gcdn.thunderstore.io/live/community/aeruta/aeruta-cover-360x480.webp"
      },
      {
        id: "an-unfinished-game",
        name: "An Unfinished Game",
        slug: "an-unfinished-game",
        banner: "https://gcdn.thunderstore.io/live/community/an-unfinished-game/an-unfinished-game-cover-360x480.webp"
      },
      {
        id: "aneurism-iv",
        name: "ANEURISM IV",
        slug: "aneurism-iv",
        banner: "https://cdn2.steamgriddb.com/thumb/9c9e7569e9191871ef1500bc3417f91e.jpg"
      },
      {
        id: "angry-birds-vr-isle-of-pigs",
        name: "Angry Birds VR",
        slug: "angry-birds-vr-isle-of-pigs",
        banner: "https://cdn2.steamgriddb.com/thumb/6dcba7c876e79d886100f21236c496ce.jpg"
      },
      {
        id: "baby-steps",
        name: "Baby Steps",
        slug: "baby-steps",
        banner: "https://cdn2.steamgriddb.com/thumb/69b4e8ec8b08f7bf278979d856c4cad1.jpg"
      },
      {
        id: "bad-north",
        name: "Bad North",
        slug: "bad-north",
        banner: "https://cdn2.steamgriddb.com/thumb/59853c24c8251189c64ec3608c87a1a1.png"
      },
      {
        id: "banjo-recompiled",
        name: "Banjo: Recompiled",
        slug: "banjo-recompiled",
        banner: "https://cdn2.steamgriddb.com/thumb/b09a78dcfcf530ae5459868210c63985.jpg"
      },
      {
        id: "beetleball",
        name: "Beetleball",
        slug: "beetleball",
        banner: "https://gcdn.thunderstore.io/live/community/beetleball/beetleball-cover-360x480.webp"
      },
      {
        id: "bendy-and-the-ink-machine",
        name: "Bendy and the Ink...",
        slug: "bendy-and-the-ink-machine",
        banner: "https://cdn2.steamgriddb.com/thumb/a4a39e8d061601e46f61ddc777113e8c.jpg"
      },
      {
        id: "beton-brutal",
        name: "BETON BRUTAL",
        slug: "beton-brutal",
        banner: "https://cdn2.steamgriddb.com/thumb/9a49c909990ccc3302ecb4a7a1ff2e59.jpg"
      },
      {
        id: "big-ambitions",
        name: "Big Ambitions",
        slug: "big-ambitions",
        banner: "https://gcdn.thunderstore.io/live/community/big-ambitions/big-ambitions-cover-360x480.webp"
      },
      {
        id: "broforce",
        name: "Broforce",
        slug: "broforce",
        banner: "https://gcdn.thunderstore.io/live/community/broforce/broforce-cover-360x480.webp"
      },
      {
        id: "carrier-deck",
        name: "Carrier Deck",
        slug: "carrier-deck",
        banner: "https://gcdn.thunderstore.io/live/community/carrier-deck/carrier-deck-cover-360x480.webp"
      },
      {
        id: "chill-with-you",
        name: "Chill with You",
        slug: "chill-with-you",
        banner: "https://gcdn.thunderstore.io/live/community/chill-with-you/chill-with-you-lo-fi-story-cover-360x480.png"
      },
      {
        id: "clover-pit",
        name: "CloverPit",
        slug: "clover-pit",
        banner: "https://gcdn.thunderstore.io/live/community/clover-pit/cloverpit-cover-360x480.webp"
      },
      {
        id: "crawlspace",
        name: "Crawlspace",
        slug: "crawlspace",
        banner: "https://gcdn.thunderstore.io/live/community/crawlspace/crawlspace-cover-360x480.webp"
      },
      {
        id: "crawlspace-2",
        name: "Crawlspace 2",
        slug: "crawlspace-2",
        banner: "https://gcdn.thunderstore.io/live/community/crawlspace-2/crawlspace-2-cover-360x480.webp"
      },
      {
        id: "crime-simulator",
        name: "Crime Simulator",
        slug: "crime-simulator",
        banner: "https://gcdn.thunderstore.io/live/community/crime-simulator/crime-simulator-cover-360x480.webp"
      },
      {
        id: "cryo",
        name: "CRYO",
        slug: "cryo",
        banner: "https://gcdn.thunderstore.io/live/community/cryo/cryo-cover-360x480.webp"
      },
      {
        id: "cursed-words",
        name: "Cursed Words",
        slug: "cursed-words",
        banner: "https://gcdn.thunderstore.io/live/community/cursed-words/cursed-words-cover-360x480.webp"
      },
      {
        id: "darkwater",
        name: "Darkwater",
        slug: "darkwater",
        banner: "https://gcdn.thunderstore.io/live/community/darkwater/darkwater-cover-360x480.webp"
      },
      {
        id: "deadly-delivery",
        name: "Deadly Delivery",
        slug: "deadly-delivery",
        banner: "https://gcdn.thunderstore.io/live/community/deadly-delivery/deadly-delivery-cover-360x480.webp"
      },
      {
        id: "depo",
        name: "DEPO : Death Epilep...",
        slug: "depo",
        banner: "https://gcdn.thunderstore.io/live/community/depo/depo-death-epileptic-pixel-origins-cover-360x480.png"
      },
      {
        id: "dinosaur-planet-recompiled",
        name: "Dinosaur Planet",
        slug: "dinosaur-planet-recompiled",
        banner: "https://gcdn.thunderstore.io/live/community/dinosaur-planet-recompiled/dinosaur-planet-recompiled-cover-360x480_A8yFwul.webp"
      },
      {
        id: "ducks-can-drive",
        name: "Ducks Can Drive",
        slug: "ducks-can-drive",
        banner: "https://gcdn.thunderstore.io/live/community/ducks-can-drive/ducks-can-drive-cover-360x480.webp"
      },
      {
        id: "easy-delivery-co",
        name: "Easy Delivery Co",
        slug: "easy-delivery-co",
        banner: "https://gcdn.thunderstore.io/live/community/easy-delivery-co/easy-delivery-co-cover-360x480.webp"
      },
      {
        id: "factory-planner",
        name: "Factory Planner",
        slug: "factory-planner",
        banner: "https://gcdn.thunderstore.io/live/community/factory-planner/factory-planner-cover-360x480.webp"
      },
      {
        id: "football-manager-26",
        name: "Football Manager 26",
        slug: "football-manager-26",
        banner: "https://gcdn.thunderstore.io/live/community/football-manager-26/football-manager-26-cover-360x480.webp"
      },
      {
        id: "forsaken-frontiers",
        name: "Forsaken Frontiers",
        slug: "forsaken-frontiers",
        banner: "https://gcdn.thunderstore.io/live/community/forsaken-frontiers/forsaken-frontiers-cover-360x480.webp"
      },
      {
        id: "goblin-buster",
        name: "Goblin Buster",
        slug: "goblin-buster",
        banner: "https://gcdn.thunderstore.io/live/community/goblin-buster/goblin-buster-cover-360x480.webp"
      },
      {
        id: "gorilla-tag",
        name: "Gorilla Tag",
        slug: "gorilla-tag",
        banner: "https://gcdn.thunderstore.io/live/community/gorilla-tag/gorilla-tag-cover-360x480.webp"
      },
      {
        id: "granny-chapter-two",
        name: "Granny: Chapter Two",
        slug: "granny-chapter-two",
        banner: "https://gcdn.thunderstore.io/live/community/granny-chapter-two/granny-chapter-two-cover-360x480.webp"
      },
      {
        id: "grey-hack",
        name: "Grey Hack",
        slug: "grey-hack",
        banner: "https://gcdn.thunderstore.io/live/community/grey-hack/grey-hack-cover-360x480.webp"
      },
      {
        id: "guilty-as-sock",
        name: "Guilty as Sock!",
        slug: "guilty-as-sock",
        banner: "https://gcdn.thunderstore.io/live/community/guilty-as-sock/guilty-as-sock-cover-360x480.png"
      },
      {
        id: "hot-lava",
        name: "Hot Lava",
        slug: "hot-lava",
        banner: "https://gcdn.thunderstore.io/live/community/hot-lava/hot-lava-cover-360x480.webp"
      },
      {
        id: "house-of-legacy",
        name: "House of Legacy",
        slug: "house-of-legacy",
        banner: "https://gcdn.thunderstore.io/live/community/house-of-legacy/house-of-legacy-cover-360x480.webp"
      },
      {
        id: "hytale",
        name: "Hytale",
        slug: "hytale",
        banner: "https://gcdn.thunderstore.io/live/community/hytale/hytale-cover-360x480.webp"
      },
      {
        id: "island-market-simulator",
        name: "Island Market Simulator",
        slug: "island-market-simulator",
        banner: "https://gcdn.thunderstore.io/live/community/island-market-simulator/island-market-simulator-cover-360x480.webp"
      },
      {
        id: "jump-space",
        name: "Jump Space",
        slug: "jump-space",
        banner: "https://gcdn.thunderstore.io/live/community/jump-space/jump-space-cover-360x480.webp"
      },
      {
        id: "keywe",
        name: "KeyWe",
        slug: "keywe",
        banner: "https://gcdn.thunderstore.io/live/community/keywe/keywe-cover-360x480.webp"
      },
      {
        id: "labyrinthine",
        name: "Labyrinthine",
        slug: "labyrinthine",
        banner: "https://gcdn.thunderstore.io/live/community/labyrinthine/labyrinthine-cover-360x480_JdsXkpK.png"
      },
      {
        id: "lens-island",
        name: "Len's Island",
        slug: "lens-island",
        banner: "https://gcdn.thunderstore.io/live/community/lens-island/lens-island-cover-360x480.webp"
      },
      {
        id: "logic-world",
        name: "Logic World",
        slug: "logic-world",
        banner: "https://gcdn.thunderstore.io/live/community/logic-world/logic-world-cover-360x480.webp"
      },
      {
        id: "lost-skies",
        name: "Lost Skies",
        slug: "lost-skies",
        banner: "https://gcdn.thunderstore.io/live/community/lost-skies/lost-skies-cover-360x480.png"
      },
      {
        id: "lost-skies-ic",
        name: "Lost Skies IC",
        slug: "lost-skies-ic",
        banner: "https://gcdn.thunderstore.io/live/community/lost-skies-ic/lost-skies-island-editor-cover-360x480.png"
      },
      {
        id: "mage-arena",
        name: "Mage Arena",
        slug: "mage-arena",
        banner: "https://gcdn.thunderstore.io/live/community/mage-arena/mage-arena-cover-360x480.webp"
      },
      {
        id: "magicite",
        name: "Magicite",
        slug: "magicite",
        banner: "https://gcdn.thunderstore.io/live/community/magicite/magicite-cover-360x480.png"
      },
      {
        id: "malteses-fluffy-onsen",
        name: "Maltese's Fluffy Onsen",
        slug: "malteses-fluffy-onsen",
        banner: "https://gcdn.thunderstore.io/live/community/malteses-fluffy-onsen/malteses-fluffy-onsen-cover-360x480.webp"
      },
      {
        id: "mewgenics",
        name: "Mewgenics",
        slug: "mewgenics",
        banner: ""
      },
      { id: "mimesis", name: "Mimesis", slug: "mimesis", banner: "" },
      {
        id: "mine-mogul",
        name: "MineMogul",
        slug: "mine-mogul",
        banner: ""
      },
      {
        id: "my-winter-car",
        name: "My Winter Car",
        slug: "my-winter-car",
        banner: ""
      },
      {
        id: "mycopunk",
        name: "Mycopunk",
        slug: "mycopunk",
        banner: ""
      },
      {
        id: "necropolis",
        name: "Necropolis",
        slug: "necropolis",
        banner: ""
      },
      {
        id: "nuclear-option",
        name: "Nuclear Option",
        slug: "nuclear-option",
        banner: ""
      },
      {
        id: "on-together",
        name: "On-Together: Virtual Co-Working",
        slug: "on-together",
        banner: ""
      },
      {
        id: "ostranauts",
        name: "Ostranauts",
        slug: "ostranauts",
        banner: ""
      },
      {
        id: "pac-man-world-re-pac",
        name: "PAC-MAN WORLD Re-PAC",
        slug: "pac-man-world-re-pac",
        banner: ""
      },
      {
        id: "painting-vr",
        name: "Painting VR",
        slug: "painting-vr",
        banner: ""
      },
      {
        id: "pair-a-dice",
        name: "Pair A Dice",
        slug: "pair-a-dice",
        banner: ""
      },
      {
        id: "paper-animal-adventure",
        name: "Paper Animal Adventure",
        slug: "paper-animal-adventure",
        banner: ""
      },
      {
        id: "paradiddle",
        name: "Paradiddle",
        slug: "paradiddle",
        banner: ""
      },
      {
        id: "patapon-1-2-replay",
        name: "PATAPON 1+2 REPLAY",
        slug: "patapon-1-2-replay",
        banner: ""
      },
      { id: "peak", name: "PEAK", slug: "peak", banner: "" },
      { id: "pigface", name: "PIGFACE", slug: "pigface", banner: "" },
      {
        id: "pit-of-goblin",
        name: "Pit of Goblin",
        slug: "pit-of-goblin",
        banner: ""
      },
      {
        id: "project-arrhythmia",
        name: "Project Arrhythmia",
        slug: "project-arrhythmia",
        banner: ""
      },
      {
        id: "project-gorgon",
        name: "Project Gorgon",
        slug: "project-gorgon",
        banner: ""
      },
      {
        id: "pushing-it-together-sisyphus",
        name: "Pushing it! Together - Sisyphus Co-op",
        slug: "pushing-it-together-sisyphus",
        banner: ""
      },
      { id: "puttler", name: "Puttler", slug: "puttler", banner: "" },
      {
        id: "r5valkyrie",
        name: "R5Valkyrie",
        slug: "r5valkyrie",
        banner: ""
      },
      {
        id: "random-access-mayhem",
        name: "RAM: Random Access Mayhem",
        slug: "random-access-mayhem",
        banner: ""
      },
      {
        id: "resonite",
        name: "Resonite",
        slug: "resonite",
        banner: ""
      },
      {
        id: "return-from-core",
        name: "Return From Core",
        slug: "return-from-core",
        banner: ""
      },
      {
        id: "return-of-the-obra-dinn",
        name: "Return of the Obra Dinn",
        slug: "return-of-the-obra-dinn",
        banner: ""
      },
      {
        id: "rv-there-yet",
        name: "RV There Yet?",
        slug: "rv-there-yet",
        banner: ""
      },
      {
        id: "scrap-mechanic",
        name: "Scrap Mechanic",
        slug: "scrap-mechanic",
        banner: ""
      },
      {
        id: "slashers-keep",
        name: "Slasher's Keep",
        slug: "slashers-keep",
        banner: ""
      },
      {
        id: "sledding-game",
        name: "Sledding Game",
        slug: "sledding-game",
        banner: ""
      },
      {
        id: "smushi-come-home",
        name: "Smushi Come Home",
        slug: "smushi-come-home",
        banner: ""
      },
      {
        id: "soulcalibur-vi",
        name: "SOULCALIBUR VI",
        slug: "soulcalibur-vi",
        banner: ""
      },
      {
        id: "spaghetti-kart",
        name: "Spaghetti Kart",
        slug: "spaghetti-kart",
        banner: ""
      },
      {
        id: "jump-scare-mansion",
        name: "Spooky's Jump Scare Mansion: HD Renovation",
        slug: "jump-scare-mansion",
        banner: ""
      },
      {
        id: "starfox-64-recompiled",
        name: "Starfox 64: Recompiled",
        slug: "starfox-64-recompiled",
        banner: ""
      },
      {
        id: "stolen-realm",
        name: "Stolen Realm",
        slug: "stolen-realm",
        banner: ""
      },
      {
        id: "super-battle-golf",
        name: "Super Battle Golf",
        slug: "super-battle-golf",
        banner: ""
      },
      {
        id: "super-fantasy-kingdom",
        name: "Super Fantasy Kingdom",
        slug: "super-fantasy-kingdom",
        banner: ""
      },
      {
        id: "super-mario-3d-world",
        name: "Super Mario 3D World",
        slug: "super-mario-3d-world",
        banner: ""
      },
      {
        id: "the-farmer-was-replaced",
        name: "The Farmer Was Replaced",
        slug: "the-farmer-was-replaced",
        banner: ""
      },
      {
        id: "unfair-flips",
        name: "Unfair Flips",
        slug: "unfair-flips",
        banner: ""
      },
      { id: "vellum", name: "Vellum", slug: "vellum", banner: "" },
      {
        id: "very-very-valet",
        name: "Very Very Valet",
        slug: "very-very-valet",
        banner: ""
      },
      { id: "vigil", name: "Vigil", slug: "vigil", banner: "" },
      {
        id: "word-play",
        name: "Word Play",
        slug: "word-play",
        banner: ""
      },
      { id: "yapyap", name: "YAPYAP", slug: "yapyap", banner: "" }
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
