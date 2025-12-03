/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
	const form = document.getElementById("trivia-form");
	const newPlayerButton = document.getElementById("new-player");

	// Initialize the game
	checkUsername();
	fetchQuestions();
	displayScores();

	// Event listeners for form submission and new player button
	form.addEventListener("submit", handleFormSubmit);
	newPlayerButton.addEventListener("click", newPlayer);
});

/**
 * Creates HTML for answer options.
 * @param {string} correctAnswer - The correct answer for the question.
 * @param {string[]} incorrectAnswers - Array of incorrect answers.
 * @param {number} questionIndex - The index of the current question.
 * @returns {string} HTML string of answer options.
 */
function createAnswerOptions(
	correctAnswer,
	incorrectAnswers,
	questionIndex
) {
	const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
		() => Math.random() - 0.5
	);
	return allAnswers
		.map(
			(answer) => `
		<label>
			<input type="radio" name="answer${questionIndex}" value="${answer}" ${
				answer === correctAnswer ? 'data-correct="true"' : ""
			}>
			${answer}
		</label>
	`
		)
		.join("");
}

/**
 * Toggles the display of the loading state and question container.
 *
 * @param {boolean} isLoading - Indicates whether the loading state should be shown.
 */
function showLoading(isLoading) {
	document.getElementById("loading-container").classList = isLoading
		? ""
		: "hidden";
	document.getElementById("question-container").classList = isLoading
		? "hidden"
		: "";
}

/**
 * Displays fetched trivia questions.
 * @param {Object[]} questions - Array of trivia questions.
 */
function displayQuestions(questions) {
	const questionContainer = document.getElementById("question-container");
	questionContainer.innerHTML = ""; // Clear existing questions
	questions.forEach((question, index) => {
		const questionDiv = document.createElement("div");
		questionDiv.innerHTML = `
			<p>${question.question}</p>
			${createAnswerOptions(
				question.correct_answer,
				question.incorrect_answers,
				index
			)}
		`;
		questionContainer.appendChild(questionDiv);
	});
}

/**
 * Fetches trivia questions from the API and displays them.
 */
function fetchQuestions() {
	showLoading(true); // Show loading state

	fetch("https://opentdb.com/api.php?amount=10&type=multiple")
		.then((response) => response.json())
		.then((data) => {
			console.log(data)
			displayQuestions(data.results);
			showLoading(false); // Hide loading state
		})
		.catch((error) => {
			console.error("Error fetching questions:", error);
			showLoading(false); // Hide loading state on error
		});
}

/**
 * Stores a cookie with a given name, value, and expiration days.
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store in the cookie.
 * @param {number} days - Number of days until the cookie expires.
 */

// function setCookie
function setCookie(name, value, days) { 
    let expires = "";
    if (days) {
        const date = new Date(); 
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); 
        expires = `; expires=${date.toUTCString()}`; 
    }

    // Set the cookie with name, value and expiration
    document.cookie = `${name}=${value}${expires}`;

	console.log(`${name} cookie set`);
} 

// Function deleteCookie 
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 1 Jan 1970 00:00:01 GMT;`;
    console.log(`${name} cookie has been deleted.`);
}

/**
 * Gets the value assigned to a browser cookie
 * @param {string} name - the name of the cookie
 * Returns {string} - Cookie value
 */

function getCookie(name) {
    const cookiesArray = document.cookie.split(";");
    for (let i = 0; i < cookiesArray.length; i++) {
        const cookie = cookiesArray[i].trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring((name + "=").length);
        }
    }
    return "";
}

//Function checkUsername
function checkUsername() {
    const username = getCookie("username") 

    if (username) {
        document.getElementById("username").classList.add("hidden");
        document.getElementById("submit-game").classList.remove("hidden");
        document.getElementById("new-player").classList.remove("hidden");
        document.getElementById("question-container").classList.remove("hidden");

    } else {
        document.getElementById("username").classList.remove("hidden");
        document.getElementById("submit-game").classList.remove("hidden");
        document.getElementById("new-player").classList.add("hidden");
        document.getElementById("question-container").classList.add("hidden");

    }
}

/**
 * @param {Event} event - The form submission event.
 */

// Function handleFormSubmit
function handleFormSubmit(event) {
    event.preventDefault();

    const usernameField = document.getElementById("username");
	const username = getCookie("username") || usernameField.value.trim();


	if (!username) {
		alert("Please enter a username.");
		return;
	}

    if (!getCookie("username")) {
        setCookie("username", username, 7);
    }

	const FinalScore = calculateScore(); 

	document.getElementById("score-display").textContent = `Your score: ${FinalScore}`;
	
	saveScore({ username, score: FinalScore });

	displayScores();

	resetGameUI();
	fetchQuestions();
	console.log("Form successfully submitted!");
}

/**
	* Calculates the final score based on selected correct answers.
	* @returns {number} Final score.
	*/
function calculateScore() {
    let score = 0; 
	const selectedOptions = document.querySelectorAll("input[type='radio']:checked");

    selectedOptions.forEach(option => {
        if (option.getAttribute("data-correct") === "true") {
            score++;
        }
    });

    return score; 
}
    
// Function getUserAnswers
function getUserAnswers() {
	const answers = [];
	for (let i = 0; i < 10; i++) {
		const selected = document.querySelector(`input[name="answer${i}"]:checked`);
		if (selected) {
			answers.push(selected.value);
		} else {
			answers.push("");
		}
	}
	return answers;
}


// Function saveScore
function saveScore(scoreObj) {
	let scores = JSON.parse(localStorage.getItem("scores")) || [];
	scores.push(scoreObj);
	localStorage.setItem("scores", JSON.stringify(scores));

}

// Function displayScores
function displayScores() {
    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    const scoresTable = document.getElementById("scoresTable");  // Corrected ID

    // Clear any existing scores in the table
    scoresTable.innerHTML = "";

    if (scores.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 2;
        cell.style.textAlign = "center";
        row.appendChild(cell);
        scoresTable.appendChild(row);
        return;
    }

    scores.forEach((entry) => {
        if (entry.username && typeof entry.score !== "undefined") {
            const row = createScoreRow(entry.username, entry.score);
            scoresTable.appendChild(row);
        }
    });
}



/**
 * Resets the game UI and allows a new player to start.
 */
function newPlayer() {
    deleteCookie("username");

    const usernameField = document.getElementById("username");
    usernameField.value = "";  
    usernameField.disabled = false;  
    usernameField.classList.remove("hidden");

    document.getElementById("submit-game").textContent = "Start Game";  // Update button text
    document.getElementById("new-player").classList.add("hidden");  // Hide new player button
    document.getElementById("question-container").classList.add("hidden");  // Hide question container
    document.getElementById("score-display").textContent = "";  // Clear the score display

    displayScores();  // Display saved scores again

    console.log("New player session started.");
}


// Function createScoreRow
function createScoreRow(username, score) {
	const row = document.createElement("tr");

	const nameCell = document.createElement("td");
	nameCell.textContent = username;

	const scoreCell = document.createElement("td");
	scoreCell.textContent = score;

	row.appendChild(nameCell);
	row.appendChild(scoreCell);

	return row;
}


// Function resetGameUI 
function resetGameUI() {
	document.getElementById("score-display").textContent = "";
	document.getElementById("question-container").innerHTML = "";
}
