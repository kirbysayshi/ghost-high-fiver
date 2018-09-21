import * as SpritesInfo from "../assets/sprites.json";
import { SpriteDesc } from "./common";

type GhostAnswer = string;
type GhostAnswerIndex = number;

type GhostPrompt = {
  name: string;
  // desc: SpriteDesc;
  problem: string[];
  answers: GhostAnswer[];
  correct: GhostAnswerIndex;
  responses: {
    right: string[];
    wrong: string[];
  };
};

export const Ghosts = new Map<SpriteDesc, GhostPrompt>();

Ghosts.set(SpritesInfo.ghost_bun, {
  name: "BUNNY GHOST",
  problem: [
    "I'm so fluffy and cuddly,",
    "no one will ever be scared",
    "of me!"
  ],
  answers: ["Hug it", "Love it", "Yell at it", "Back slowly away from it"],
  correct: 3,
  responses: {
    right: ["I scared you!?", "AMAZING WILL YOU BE MY FRIEND?"],

    // TODO: "wrong" should have one response for each choice above.
    wrong: ["Ugh please don't touch me."]
  }
});

Ghosts.set(SpritesInfo.ghost_bat, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_cat, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_hungry, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_ink, {
  name: "INKY GHOST",
  problem: [
    "Everywhere I go I leave trails!",
    "I'll never scare anyone",
    "like this..."
  ],
  answers: ["High five it", "Give it a pen", "Poke it", "Give it some paper"],
  correct: 1,
  responses: {
    right: ["Now I can write scary letters!", "Will you be my friend?"],
    wrong: ["Sigh. Follow the trail when", "you think of something better."]
  }
});

Ghosts.set(SpritesInfo.ghost_jaws, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_petrified, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});

Ghosts.set(SpritesInfo.ghost_plant, {
  name: "SPROUTY SPIRIT",
  problem: ["I was taken from my forest", "and I really miss my garden."],
  answers: [
    "Water it",
    "Coax it into the sun",
    "Give it a pot",
    'Say, "I\'m sorry"'
  ],
  correct: 2,
  responses: {
    right: ["I can grow things with you!", "YOUR HOME WILL BE MY FOREST!"],
    wrong: ["My plant love is wasted..."]
  }
});

Ghosts.set(SpritesInfo.ghost_shy, {
  name: "",
  problem: [],
  answers: [],
  correct: -1,
  responses: {
    right: [""],
    wrong: [""]
  }
});
