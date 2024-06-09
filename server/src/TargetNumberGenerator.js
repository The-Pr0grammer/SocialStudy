function generateTargetNumber() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const operations = ['+', '-', '*', '/'];
    const chosenNumbers = [
      numbers[Math.floor(Math.random() * numbers.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      numbers[Math.floor(Math.random() * numbers.length)]
    ];
    const chosenOperations = [
      operations[Math.floor(Math.random() * operations.length)],
      operations[Math.floor(Math.random() * operations.length)]
    ];
  
    // Ensure division results in a whole number
    if (chosenOperations[0] === '/') {
      chosenNumbers[1] = chosenNumbers[0] * chosenNumbers[1];  // Adjust second number to be a multiple of the first
    }
    if (chosenOperations[1] === '/' && chosenOperations[0] !== '/') {
      chosenNumbers[2] = chosenNumbers[1] * chosenNumbers[2];  // Adjust third number to be a multiple of the second
    }
  
    const equation = `${chosenNumbers[0]} ${chosenOperations[0]} ${chosenNumbers[1]} ${chosenOperations[1]} ${chosenNumbers[2]}`;
    const targetNumber = eval(equation);
    return { targetNumber };
    
  }