// Fix mobile 100vh issues by setting a CSS variable --vh based on window.innerHeight
function setVh() {
  // --vh will be equal to 1% of the viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// Initialize and update on resize/orientation change
setVh();
window.addEventListener("resize", setVh);
window.addEventListener("orientationchange", setVh);

function removeLoading() {
  const loading = document.getElementById("loading");
  loading.classList.add("d-none");
  loading.classList.remove("d-flex");
}
function addLoading() {
  const loading = document.getElementById("loading");
  loading.classList.remove("d-none");
  loading.classList.add("d-flex");
}

function createAndPopulateCards(data) {
  const cardsContainer = document.querySelector(".cards-container");

  for (let i = 0; i < data.length; i++) {
    const cardData = data[i];

    const card = document.createElement("div");
    card.classList.add(
      "col-5",
      "col-md-2",
      "py-3",
      "mr-4",
      "rounded",
      "now-card"
    );
    card.style.height = "fit-content";
    card.style.border = "1px solid rgba(222, 226, 230, 0.31)";

    const cardBody = document.createElement("div");
    cardBody.classList.add("text-center", "text-light");
    const hour = document.createElement("p");
    hour.classList.add("hour-card");
    const cardImage = document.createElement("img");
    cardImage.classList.add("card-img-top");
    const cardTitle = document.createElement("p");
    cardTitle.classList.add("title-card");
    const cardText = document.createElement("p");
    cardText.classList.add("temperature-card");

    const dataAtual = new Date();
    const hourNow = String(dataAtual.getHours()).padStart(2, "0");
    const hourListApi = cardData.time.split(" ")[1].split(":")[0];
    hour.textContent =
      hourNow.toString() === hourListApi
        ? "Agora"
        : cardData.time.split(" ")[1];
    cardImage.src = cardData.condition.icon;
    cardImage.alt = cardData.condition.text;
    cardImage.style.height = "82px";
    cardImage.style.width = "82px";
    cardTitle.textContent = cardData.condition.text;
    cardText.textContent = `${Math.floor(cardData.temp_c)} °C`;

    cardBody.appendChild(hour);
    cardBody.appendChild(cardImage);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);

    cardsContainer.appendChild(card);
  }

  scrollToCurrentTime();

  function scrollToCurrentTime() {
    const cards = cardsContainer.getElementsByClassName("hour-card");
    const nowCard = document.querySelectorAll(".now-card");

    for (let i = 0; i < cards.length; i++) {
      if (cards[i].textContent === "Agora") {
        nowCard[i].style.border = "3px solid rgb(255, 255, 255)";
        const containerRect = cardsContainer.getBoundingClientRect();
        const cardRect = cards[i].getBoundingClientRect();
        const offset =
          cardRect.left -
          containerRect.left -
          (containerRect.width - cardRect.width) / 2;

        cardsContainer.scrollBy({
          left: offset,
          behavior: "smooth",
        });

        break;
      }
    }
  }
}

function createAndPopulateList(data) {
  const listContainer = document.querySelector(".list-container");

  for (let i = 0; i < data.length; i++) {
    const cardData = data[i];

    const list = document.createElement("li");
    list.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    const day = document.createElement("span");
    day.classList.add("day");
    const iconDay = document.createElement("img");
    iconDay.classList.add("icon-day");
    const minTemperature = document.createElement("span");
    minTemperature.classList.add("min-temperature");
    const maxTemperature = document.createElement("span");
    maxTemperature.classList.add("max-temperature");

    const dateConverted = new Date(cardData.date);
    const dayDate = dateConverted.getDate() + 1;
    const month = dateConverted.getMonth() + 1;
    const year = dateConverted.getFullYear();
    const dayNow = new Date().getDate();

    day.textContent =
      dayNow === dayDate ? "Hoje" : `${dayDate}/${month}/${year}`;
    iconDay.src = cardData.day.condition.icon;
    iconDay.alt = cardData.day.condition.text;
    iconDay.style.height = "42px";
    iconDay.style.width = "42px";
    iconDay.style.marginLeft = dayNow === dayDate ? "50px" : "";
    minTemperature.textContent = `${Math.floor(cardData.day.mintemp_c)} °C`;
    maxTemperature.textContent = `${Math.floor(cardData.day.maxtemp_c)} °C`;

    list.appendChild(day);
    list.appendChild(iconDay);
    list.appendChild(minTemperature);
    list.appendChild(maxTemperature);

    listContainer.appendChild(list);
  }
}

function updatedLayout(response) {
  const backgroundColor = document.getElementById("background-color");
  // Ensure height uses the --vh variable (works better on mobile browsers)
  backgroundColor.style.height = "calc(var(--vh, 1vh) * 100)";
  const city = document.getElementById("city");
  const hours = document.getElementById("hours");
  const weatherType = document.getElementById("weather-type");
  const temperature = document.getElementById("temperature");
  const imageTemperature = document.getElementById("image-temperature");

  if (
    response.location.localtime.split(" ")[1].split(":")[0] >= 5 &&
    response.location.localtime.split(" ")[1].split(":")[0] < 18
  ) {
    backgroundColor.style.background =
      "linear-gradient(180deg, #2F5AF4 0%, #0FA2AB 100%)";
  } else if (
    response.location.localtime.split(" ")[1].split(":")[0] >= 18 &&
    response.location.localtime.split(" ")[1].split(":")[0] < 5
  ) {
    backgroundColor.style.background = "#1D2837";
  }

  city.innerHTML = response.location.name;
  hours.innerHTML = response.location.localtime.split(" ")[1];
  weatherType.innerHTML = response.current.condition.text;
  temperature.innerHTML = `${Math.floor(response.current.temp_c)} °C`;
  imageTemperature.src = response.current.condition.icon;
  imageTemperature.style.height = "144px";
  imageTemperature.style.width = "144px";
  imageTemperature.addEventListener("load", function () {
    imageTemperature.setAttribute("alt", "Imagem da temperatura atual");
  });

  const conditionCurrentDay = response.forecast.forecastday[0].hour;
  createAndPopulateCards(conditionCurrentDay);

  const forecastday = response.forecast.forecastday;
  createAndPopulateList(forecastday);
}

function successLatitudeLongitude(location) {
  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;
  uploadWeatherForecast(latitude, longitude);
}

function errorLatitudeLongitude(err) {
  console.error(err);
  const modal = document.getElementById("staticBackdrop");
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

function uploadWeatherForecast(latitude, longitude) {
  const backgroundColor = document.getElementById("background-color");
  backgroundColor.style.background = "black";

  addLoading();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status >= 200 && this.status < 300) {
        const response = JSON.parse(xhttp.responseText);
        console.log(response);
        updatedLayout(response);

        removeLoading();
      } else {
        displayError("Error: " + xhttp.status);
      }
    }
  };

  xhttp.open(
    "GET",
    `https://api.weatherapi.com/v1/forecast.json?key=d84615236b0341da872125653231510&q=${latitude},${longitude}&days=7&lang=pt`,
    true
  );
  xhttp.send();
}

function displayError(mensagem) {
  console.error(mensagem);
}

function launchApp() {
  navigator.geolocation.getCurrentPosition(
    successLatitudeLongitude,
    errorLatitudeLongitude
  );
}

window.onload = function () {
  launchApp();
};
