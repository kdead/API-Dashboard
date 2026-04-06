console.log("JavaScript is connected!");

async function loadQuote() {
  const quoteCard = document.getElementById("quote-card");

  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json();

    const advice = data.slip.advice;

    quoteCard.innerHTML = `
      <h2>Quote of the Day</h2>
      <p>"${advice}"</p>
      <button id="new-quote-btn">New Quote</button>
    `;

    document
      .getElementById("new-quote-btn")
      .addEventListener("click", loadQuote);
  } catch (error) {
    quoteCard.innerHTML = `
      <h2>Quote of the Day</h2>
      <p>Sorry, the quote could not be loaded.</p>
    `;
    console.error("Quote error:", error);
  }
}

loadQuote();

async function loadJoke() {
  const jokeCard = document.getElementById("joke-card");

  try {
    const response = await fetch("https://v2.jokeapi.dev/joke/Any?safe-mode");
    const data = await response.json();

    let jokeHTML = "";

    if (data.type === "single") {
      jokeHTML = `<p>${data.joke}</p>`;
    } else {
      jokeHTML = `
        <p><strong>${data.setup}</strong></p>
        <p>${data.delivery}</p>
      `;
    }

    jokeCard.innerHTML = `
      <h2>Joke of the Day</h2>
      ${jokeHTML}
      <button id="new-joke-btn">New Joke</button>
    `;

    document.getElementById("new-joke-btn").addEventListener("click", loadJoke);
  } catch (error) {
    jokeCard.innerHTML = `
      <h2>Joke of the Day</h2>
      <p>Sorry, the joke could not be loaded.</p>
    `;
    console.error("Joke error:", error);
  }
}

loadJoke();

async function loadFact() {
  const factCard = document.getElementById("fact-card");

  try {
    const response = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random",
    );
    const data = await response.json();

    factCard.innerHTML = `
      <h2>Fact of the Day</h2>
      <p>${data.text}</p>
      <button id="new-fact-btn">New Fact</button>
    `;

    document.getElementById("new-fact-btn").addEventListener("click", loadFact);
  } catch (error) {
    factCard.innerHTML = `
      <h2>Fact of the Day</h2>
      <p>Sorry, the fact could not be loaded.</p>
    `;
    console.error("Fact error:", error);
  }
}

loadFact();

async function loadWeather(city) {
  const weatherResult = document.getElementById("weather-result");

  try {
    weatherResult.innerHTML = `<p>Loading weather...</p>`;

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherResult.innerHTML = `<p>City not found.</p>`;
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`,
    );
    const weatherData = await weatherResponse.json();

    const temperatureC = weatherData.current.temperature_2m;
    const temperatureF = (temperatureC * 9) / 5 + 32;
    const windSpeed = weatherData.current.wind_speed_10m;

    weatherResult.innerHTML = `
      <p><strong>${name}, ${country}</strong></p>
      <p>Temperature: ${temperatureF.toFixed(1)}°F</p>
      <p>Wind Speed: ${windSpeed} km/h</p>
    `;
  } catch (error) {
    weatherResult.innerHTML = `<p>Sorry, weather could not be loaded.</p>`;
    console.error("Weather error:", error);
  }
}

document.getElementById("weather-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();

  if (city === "") {
    document.getElementById("weather-result").innerHTML =
      `<p>Please enter a city.</p>`;
    return;
  }

  loadWeather(city);
});

async function loadGitHubUser(username) {
  const githubResult = document.getElementById("github-result");

  try {
    githubResult.innerHTML = `<p>Loading user...</p>`;

    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    if (data.message === "Not Found") {
      githubResult.innerHTML = `<p>User not found.</p>`;
      return;
    }

    githubResult.innerHTML = `
      <img src="${data.avatar_url}" alt="${data.login}" width="100">
      <p><strong>${data.name || data.login}</strong></p>
      <p>${data.bio || "No bio available."}</p>
      <p>Followers: ${data.followers}</p>
      <p>Public Repos: ${data.public_repos}</p>
      <p><a href="${data.html_url}" target="_blank">View Profile</a></p>
    `;
  } catch (error) {
    githubResult.innerHTML = `<p>Sorry, GitHub user could not be loaded.</p>`;
    console.error("GitHub error:", error);
  }
}
document.getElementById("github-btn").addEventListener("click", () => {
  const username = document.getElementById("github-input").value.trim();

  if (username === "") {
    document.getElementById("github-result").innerHTML =
      `<p>Please enter a username.</p>`;
    return;
  }

  loadGitHubUser(username);
});

async function loadRadioStations(searchTerm) {
  const radioResult = document.getElementById("radio-result");

  try {
    radioResult.innerHTML = `<p>Loading stations...</p>`;

    const response = await fetch(
      `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(searchTerm)}&limit=5`,
    );
    const data = await response.json();

    if (data.length === 0) {
      radioResult.innerHTML = `<p>No stations found.</p>`;
      return;
    }

    radioResult.innerHTML = `
      <h3>Top Results</h3>
      ${data
        .map(
          (station) => `
            <div class="radio-station">
              <p><strong>${station.name}</strong></p>
              <p>Country: ${station.country || "Unknown"}</p>
              <p>Tags: ${station.tags || "None listed"}</p>
              <p><a href="${station.homepage}" target="_blank">Station Website</a></p>
            </div>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    radioResult.innerHTML = `<p>Sorry, radio stations could not be loaded.</p>`;
    console.error("Radio error:", error);
  }
}

document.getElementById("radio-btn").addEventListener("click", () => {
  const searchTerm = document.getElementById("radio-input").value.trim();

  if (searchTerm === "") {
    document.getElementById("radio-result").innerHTML =
      `<p>Please enter a search term.</p>`;
    return;
  }

  loadRadioStations(searchTerm);
});

async function loadHashnodePosts() {
  const hashnodeResult = document.getElementById("hashnode-result");

  try {
    hashnodeResult.innerHTML = `<p>Loading dev news...</p>`;

    const query = `
      query GetPosts {
        publication(host: "engineering.hashnode.com") {
          posts(first: 5) {
            edges {
              node {
                title
                brief
                url
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://gql.hashnode.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("Hashnode response:", data);

    if (data.errors) {
      hashnodeResult.innerHTML = `<p>Could not load dev news.</p>`;
      console.error("Hashnode GraphQL errors:", data.errors);
      return;
    }

    const posts = data.data.publication.posts.edges;

    hashnodeResult.innerHTML = `
      ${posts
        .map(
          (post) => `
            <div class="dev-post">
              <p><strong>${post.node.title}</strong></p>
              <p>${post.node.brief}</p>
              <p><a href="${post.node.url}" target="_blank">Read More</a></p>
            </div>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    hashnodeResult.innerHTML = `<p>Sorry, dev news could not be loaded.</p>`;
    console.error("Hashnode error:", error);
  }
}
document
  .getElementById("hashnode-btn")
  .addEventListener("click", loadHashnodePosts);
async function loadFoodReport() {
  const foodResult = document.getElementById("food-result");

  try {
    foodResult.innerHTML = `<p>Loading food report...</p>`;

    const response = await fetch("https://foodish-api.com/api/");
    const data = await response.json();

    foodResult.innerHTML = `
      <p><strong>Food Inspiration</strong></p>
      <img src="${data.image}" alt="Food" style="width: 100%; border-radius: 10px; margin-top: 10px;">
      <button id="new-food-btn">Load Another</button>
    `;

    document
      .getElementById("new-food-btn")
      .addEventListener("click", loadFoodReport);
  } catch (error) {
    foodResult.innerHTML = `<p>Sorry, food content could not be loaded.</p>`;
    console.error("Food error:", error);
  }
}
document.getElementById("food-btn").addEventListener("click", loadFoodReport);
