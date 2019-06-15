import React, { Component } from 'react';
import './api.css';

const WUNDERGROUND_KEY = "eb333ace1293634111b0727b68532c21";



class Api extends Component {

  constructor (props) {
      super(props);
      this.state = {};

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
              this.setState({
                  coordinates: pos.coords
              });
              
          }, () => {
            this.check();
          }, options);
      }

      this.check();

      setInterval(() => this.check(), 10 * 60 * 1000);
  }


  check () {
      fetch("https://ipinfo.io/json?token=9835fa47816b04")
        .then(res => res.json())
        .then(ip => {
            const query = [this.state.coordinates.latitude, this.state.coordinates.longitude];
            const WUNDERGROUND_URL = `http://api.openweathermap.org/data/2.5/weather?lat=${query[0]}&lon=${query[1]}&appid=${WUNDERGROUND_KEY}`;
            return fetch(WUNDERGROUND_URL)
        })
        .then(c => c.json())
        .then(forecast => {
            this.setState({
                forecast
            });
        });
  }

  renderWeatherToday () {
      const today = this.state.forecast;
      let data = {
        city : today.name,
        gl:today.main.grnd_level,
        hum:today.main.humidity,
        press:today.main.pressure, 
        sl:today.main.sea_level, 
        t:Math.round(today.main.temp-273.15), 
        tmax:today.main.temp_max, 
        tmin:today.main.temp_min,
        icon : today.weather[0].icon,
        wm : today.weather[0].main,
        wd : today.weather[0].description.split(" ").map( e => e.charAt(0).toUpperCase()+e.substring(1, e.length)).join(" "),
        widdeg : today.wind.deg,
        widspd : today.wind.speed,
      };


      let temp = data.t;
      let icon = `http://openweathermap.org/img/w/${data.icon}.png`;


      if (temp) {
          var tempElm = <div className="big-temp">{temp}</div>;
      }

      return (
          <div className="weather-today">
            <div className="current-weather"> Displaying Current Weather of <span>{data.city}</span> </div>
            <div className="icon-wrapper">
                <div className="temp">{tempElm}</div>
                <div>
                    <img src={icon}></img>
                </div>
            <p className="icon-description">{data.wd}</p>

            </div>
            <div className="other-data"> Humidity : <span>{data.hum}</span> , Sea Level : <span>{data.sl}</span> , Wind Speed : <span>{data.widspd}</span> </div>
          </div>
      );
  }

  renderNextDays () {

    let data = [];
    const query = [this.state.coordinates.latitude, this.state.coordinates.longitude];
    const WUNDERGROUND_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${query[0]}&lon=${query[1]}&appid=${WUNDERGROUND_KEY}`;

        fetch(WUNDERGROUND_URL)
        .then( json => json.json() )
        .then( d => {
            d.list.map( e => {
                
                var date = new Date(e.dt*1000);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var formattedTime = hours + ':' + minutes.substr(-2);
                
                data.push({
                    date: [formattedTime, date.toString()],
                    date_text:e.dt_txt,
                    hum:e.main.humidity,
                    press:e.main.pressure, 
                    sl:e.main.sea_level, 
                    t:Math.round(e.main.temp-273.15), 
                    tmax:e.main.temp_max, 
                    tmin:e.main.temp_min,
                    icon : e.weather[0].icon,
                    wm : e.weather[0].main,
                    wd : e.weather[0].description.split(" ").map( e => e.charAt(0).toUpperCase()+e.substring(1, e.length)).join(" "),
                    widdeg : e.wind.deg,
                    widspd : e.wind.speed,
                })
            })
            this.setState({
                spk:data
            })
        });

  }

  showData(){

    this.renderNextDays();

    if(this.state.spk){
        let data = this.state.spk;
        return (
            <div className="spk">
                {
                    data.map( (e,i) => {
                        return (
                            <div className="single-day" key={i}>
                                <div className="date">{e.date[1]}</div>
                                <div className="desc">{e.wd}</div>
                                <div className="item"> <div className="sp-temp"> {e.t}<sup>o</sup> </div> <img src={`http://openweathermap.org/img/w/${e.icon}.png`} /> </div>
                            </div>
                        )
                    })
                }
            </div>
        )  
    }




  }

  renderWeather () {
      if (!this.state.forecast) {
          return (
            <div className="weather-container">
                <h3> Weather API </h3>
                <p>Please Wait while the data has been loaded from the API...</p>
            </div>
          );
      }
      return (
        <div className="weather-container">
            {this.renderWeatherToday()}
            <hr/>
            <div className="sp-head"> 5 Days Forecast :  </div>
            {this.showData()}
        </div>
      );
  }

  render() {
    return (
        <div>
            <div className="app">
                {this.renderWeather()}
            </div>
        </div>
    );
  }
}

export default Api;
