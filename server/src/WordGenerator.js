// Function to generate randomized blanks for a given word
const generateRandomizedBlanks = (word, wordWithBlanks, initial) => {
  // Split the word into characters
  const characters = initial ? word.split("") : wordWithBlanks.split("");
  let newBlankAdded = false;

  //if initial word
  if (initial)
    for (let i = 0; i < characters.length; i++) {
      // Check if the character is not whitespace
      if (characters[i].trim() !== "") {
        characters[i] = "_";
      }
    }
  else {
    while (!newBlankAdded) {
      const random = Math.trunc(Math.random() * (word.length - 0) + 0);

      // console.log("RANDOMMMMMMMMM", random);

      if (characters[random].trim() !== "" && characters[random] == "_") {
        characters[random] = word[random];
        newBlankAdded = true; // Mark that a blank has been added
      }
    }
  }

  // Join the characters back into a string
  return characters.join("");
};
module.exports = generateRandomizedBlanks; // Exporting the function
