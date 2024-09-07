$(window).on("load", ChangeTab.bind(this, $("#tab-today-p")))
$(".tab-p").on("click", function () {
    ChangeTab($(this))
})

function ChangeTab(tab) {
    $(".tab-p").removeClass("highlighted-tab")
    tab.addClass("highlighted-tab")

    if (tab.text() === "Today") {
        $("#crn-wth-div").css("display", "block")
        $("#days-forecast-div").css("display", "none")
    } else {
        $("#crn-wth-div").css("display", "none")
        $("#days-forecast-div").css("display", "flex")
    }
    ShowTab()
}

function ShowTab() {
    let apiKey = "your-api-key"

    navigator.geolocation.getCurrentPosition(function (position) {
        let latitude = position.coords.latitude
        let longitude = position.coords.longitude

        SetCurrentWeather(latitude, longitude, apiKey)
        SetForecast(latitude, longitude, apiKey, true)
    })
}

function SetCurrentWeather(lat, lon, key) {
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/weather`,
        dataType: "json",
        data: {
            lat: lat,
            lon: lon,
            appid: key,
            units: "metric"
        },
        success: function (data) {
            $("#srch-input").val(data.name + ", " + data.sys.country)
            $("#crn-date-p").html(FormatTime(data.dt, false, true))

            $("#crn-wth").html(data.weather[0].main)
            $("#crn-wth-img").attr("src", `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`)

            $("#crn-wth-temp").html(Math.trunc(data.main.temp) + "°C")
            $("#crn-wth-temp-real-feel").html(`Real Feel ${Math.trunc(data.main.feels_like)}°`)

            $("#crn-wth-sun-rise").html(FormatTime(data.sys.sunrise, false, false))
            $("#crn-wth-sun-set").html(FormatTime(data.sys.sunset, false, false))
            $("#crn-wth-duration").html(FormatTime(data.sys.sunset * 1000 - data.sys.sunrise * 1000, true, false))
        }
    })
}

function SetForecast(lat, lon, key, isFirst) {
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/forecast`,
        dataType: "json",
        data: {
            lat: lat,
            lon: lon,
            cnt: 40,
            appid: key,
            units: "metric"
        },
        success: function (data) {
            let prevDay
            for (let i = 0, j = 0; i < data.list.length; i++) {

                let weekday = new Date(data.list[i].dt * 1000).getUTCDate()
                if (prevDay !== weekday) {
                    prevDay = weekday

                    if (j === 0)
                        $(".weekday").eq(j).html("Tonight")
                    else
                        $(".weekday").eq(j).html(new Date(data.list[i].dt * 1000).toLocaleDateString("en-US", { weekday: "long" }))
                    $(".mounthday").eq(j).html(new Date(data.list[i].dt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" }))
                    $(".days-img").eq(j).attr("src", `http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@4x.png`)
                    $(".days-temp").eq(j).html(Math.trunc(data.list[i].main.temp) + "°C")
                    $(".days-descrption").eq(j).html(data.list[i].weather[0].description)

                    $(".day-forecast-div").eq(j).on("click", ShowSelectedDay.bind(this, data, i, j))

                    if (isFirst) {
                        isFirst = false
                        $(".day-forecast-div").eq(j).css("background-color", "rgb(215, 215, 215)")
                        ShowSelectedDay(data, i, j)
                    }

                    j++
                }
            }
        }
    })
}

function ShowSelectedDay(data, i, j) {
    for (let d = 0; d < $(".day-forecast-div").length; d++)
        $(".day-forecast-div").eq(d).css("background-color", "rgb(234, 234, 234)")

    if ($(".day-forecast-div").eq(j).css("background-color") == "rgb(234, 234, 234)")
        $(".day-forecast-div").eq(j).css("background-color", "rgb(215, 215, 215)")

    SetHourly(data, i)
}

function SetHourly(data, index) {
    let day = data.list[index].dt_txt.substring(8, 10)
    for (let i = index, j = 0; j < $(".table-hr").length; i++, j++) {
        if (data.list[i].dt_txt.includes(day)) {
            $(".table-hr").eq(j).html(new Date(data.list[i].dt * 1000).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }))
            $(".table-img").eq(j).attr("src", `http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@4x.png`)
            $(".table-forecast").eq(j).html(data.list[i].weather[0].main)
            $(".table-temp").eq(j).html(Math.trunc(data.list[i].main.temp) + "°")
            $(".table-real-feel").eq(j).html(Math.trunc(data.list[i].main.feels_like) + "°")
            $(".table-wind").eq(j).html(Math.trunc(data.list[i].wind.speed) + " " + DegreesToDirection(data.list[i].wind.deg))
        }
    }
}

function FormatTime(time, isDayDuration, isYear) {
    if (isDayDuration) {
        let tmp = new Date(time).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
        return tmp.substring(0, 5) + " hr"
    }
    else if (isYear) {
        time *= 1000
        return (new Date(time).getUTCMonth() + 1) + "." + new Date(time).getUTCDate() + "." + new Date(time).getUTCFullYear()
    }
    else
        return new Date(time * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
}

function DegreesToDirection(degrees) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"]
    const index = Math.round(degrees / 22.5) % 16

    return directions[index]
}