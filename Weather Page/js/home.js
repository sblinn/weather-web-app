$(document).ready(function () {

    getWeather();

})

function getWeather() {
    $('#getWeatherBtn').click(function () {

        clearErrorMessages();
        clearWeatherResults();
        showWeatherResults();
        var zipcode = $('#zipcodeInput').val();

        if (validateZipcode(zipcode) != false) {

            var apiKey = config.API_KEY;
            var unit = $('#unitDropdownMenu li .active').text();

            $.ajax({
                type: 'GET',
                url: 'https://api.openweathermap.org/data/2.5/weather?zip=' + zipcode + '&appid=' + apiKey + '&units=' + unit,
                success: function (data) {
                    getCurrentConditions(data, unit);
                },
                error: function () {
                    $('#errorMessages')
                        .append($('<li>')
                            .attr({ class: 'list-group-item list-group-item-danger' })
                            .text('Error calling web service. Please try again later.'));
                }
            })

            $.ajax({
                type: 'GET',
                url: 'https://api.openweathermap.org/data/2.5/forecast?zip=' + zipcode + '&appid=' + apiKey + '&units=' + unit,
                success: function (data) {
                    getForecast(data, unit);
                },
                error: function () {
                    $('#errorMessages')
                        .append($('<li>')
                            .attr({ class: 'list-group-item list-group-item-danger' })
                            .text('Error calling web service. Please try again later.'));
                }
            })
        }
    })
}


function getCurrentConditions(data, unit) {
    var weather = data.weather;
    var city = data.name;
    var mainDescription = weather[0].main;
    var description = weather[0].description;
    var icon = weather[0].icon;
    var iconPath = 'http://openweathermap.org/img/w/' + icon + '.png';

    var main = data.main;
    var temp = main.temp;
    var humidity = main.humidity;
    var wind = data.wind;
    var windSpeed = wind.speed;

    var tempUnit;
    var speedUnit;

    if (unit == "Imperial") {
        tempUnit = "F";
        speedUnit = "miles/hour";
    } else if (unit == "Metric") {
        tempUnit = "C";
        speedUnit = "kilometers/hour";
    }

    var content;
    $('#currentConditionsDiv h2').append("Current Conditions in " + city);

    content = "<span class=\"col\"><img src=\"" + iconPath + "\" class=\"icon\"></img>";
    content += "<p>" + mainDescription + ": " + description + "</p></span>";
    $('#currentConditionsInfo').append(content);

    content = "<ul style=\"list-style-type:none;\">"
    content += "<li>Temperature: " + temp + " " + tempUnit + "<li>";
    content += "<li>Humidity: " + humidity + "%</li>";
    content += "<li>Wind: " + windSpeed + " " + speedUnit + "</li>";
    content += "</ul>";
    $('#currentConditionsDetails').append(content);
}

function getForecast(data, unit) {
    $('#fiveDayForecastDiv h2').text("Forecast");

    var forecast = data.list;
    var tempUnit;

    if (unit == "Imperial") {
        tempUnit = "F";
    } else if (unit == "Metric") {
        tempUnit = "C";
    }

    var datesArray = new Array(5);
    var currentDate = new Date(forecast[0].dt * 1000).toISOString().substring(0, 10);
    var datesArrayIndex = 0;
    var dataForDate = [];

    // add the first date to datesArray
    datesArray[0] = currentDate;

    // loop thru each index of the list (forecast)
    $(forecast).each(function (index) {
        currentDate = new Date(forecast[index].dt * 1000).toISOString().substring(0, 10);

        // when loop reaches the next forecast date, call 
        // calculateDailyForecast() to set up the page's col for 
        // the previous day's forecast using dataForDate, 
        // & add this new date to datesArray. 
        if (datesArray[datesArrayIndex] != currentDate) {
            var divName = "#forecastDay" + (datesArrayIndex + 1);
            calculateDailyForecast(datesArray[datesArrayIndex], 
                dataForDate, tempUnit, divName);
            dataForDate = []; // clear the data array
            datesArrayIndex++; // move to the next day
            datesArray[datesArrayIndex] = currentDate;
        }

        dataForDate.push(forecast[index]);
    })
}

function calculateDailyForecast(date, dateData, tempUnit, divName) {
    var highTemp = dateData[0].main.temp_max;
    var lowTemp = dateData[0].main.temp_min;

    var content;

    $(dateData).each(function (index) {
        var datetimeData = dateData[index];
        var mainDescription = datetimeData.weather[0].main;
        var icon = datetimeData.weather[0].icon;
        var iconPath = 'http://openweathermap.org/img/w/' + icon + '.png';

        var main = datetimeData.main;
        var temp = main.temp;

        if (main.temp_max > highTemp) {
            highTemp = main.temp_max;
        }
        if (main.temp_min < lowTemp) {
            lowTemp = main.temp_min;
        }

        var formattedTime = new Date(datetimeData.dt * 1000).toTimeString().substring(0, 5);

        content = "<ul class='list-group list-group-horizontal date-time-forecast'>";
        content += "<li><img src='" + iconPath + "' class='icon'></img></li>";
        content += "<li><ul class='date-time-forecast py-2'>"
        content += "<li>" + formattedTime + " GMT</li>";
        content += "<li>" + temp + " " + tempUnit + "</li>";
        content += "<li>" + mainDescription + "</li>";
        content += "</ul></li></ul>";

        $(divName).append(content);
    })

    var formattedDate = new Date(date).toDateString().slice(0, -4);
    var topContent = "<ul style='list-style-type:none;'>";
    topContent += "<li class='forecast-date'>" + formattedDate + "<li>";
    topContent += "<li>H: " + highTemp + " " + tempUnit + "<li>";
    topContent += "<li>L: " + lowTemp + " " + tempUnit + "</li></ul>";

    $(divName).prepend(topContent);
}


function validateZipcode(zipcode) {
    clearErrorMessages();

    if (zipcode.length != 5
        || (zipcode.match(/^[0-9]+$/) == null)
        || Math.floor(zipcode) != zipcode) {

        $('#errorMessages')
            .append($('<li>')
                .attr({ class: 'list-group-item list-group-item-danger' })
                .text('Error: zipcode invalid. Valid 5-digit zipcode required.'));
        return false;
    }
    else {
        return true;
    }
}

function clearErrorMessages() {
    $('#errorMessages').empty();
}


function clearWeatherResults() {
    $('#currentConditionsDiv h2').text('');
    $('#currentConditionsInfo').empty();
    $('#currentConditionsDetails').empty();

    $('#fiveDayForecastDiv h2').text('');
    $('#forecastDay1').empty();
    $('#forecastDay2').empty();
    $('#forecastDay3').empty();
    $('#forecastDay4').empty();
    $('#forecastDay5').empty();
}

function showWeatherResults() {
    $('#weatherResultsDiv').removeClass('set-invisible');
}

function hideWeatherResults() {
    $('#weatherResultsDiv').addClass('set-invisible');      
}