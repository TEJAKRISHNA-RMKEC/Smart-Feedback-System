const adjectives = [
    "Tactile", "Rare", "Lateral", "Dynamic", "Brisk", "Candid",
    "Swift", "Curious", "Witty", "Daring", "Silent", "Vivid",
    "Clever", "Mysterious", "Nimble", "Radiant", "Eager", "Bold",
    "Playful", "Serene", "Fierce", "Cheerful", "Whimsical", "Astute"
  ];
  
  const nouns = [
    "Rabbit", "Moon", "Tortoise", "Falcon", "Panda", "Comet",
    "Eagle", "Tiger", "Hawk", "Phoenix", "Glacier", "Cloud",
    "Wave", "Aurora", "Cobra", "Lynx", "Gale", "Storm",
    "Whale", "Puma", "Badger", "Drift", "Echo", "Blaze"
  ];
  
  export const generateUsername = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  };
  