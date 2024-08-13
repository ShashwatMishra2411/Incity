import React, { useEffect, useState } from "react";
import { fetchWeatherApi } from "openmeteo";
import RootLayout from "../layout";
import axios from "axios";
import Outfit from "@/components/Outfit";
import HealthCard from "@/components/HealthCard";
export default function Weather() {
  const [data, setData] = useState(null);
  const [res, setRes] = useState(null);
  const [res1, setRes1] = useState(null);

  useEffect(() => {
    async function fetch() {
      const params = {
        latitude: 52.52,
        longitude: 13.41,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "precipitation",
          "rain",
          "wind_speed_10m",
        ],
        daily: ["temperature_2m_max", "temperature_2m_min"],
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);

      const range = (start, stop, step) =>
        Array.from(
          { length: (stop - start) / step },
          (_, i) => start + i * step
        );

      const response = responses[0];

      const utcOffsetSeconds = response.utcOffsetSeconds();
      const timezone = response.timezone();
      const timezoneAbbreviation = response.timezoneAbbreviation();
      const latitude = response.latitude();
      const longitude = response.longitude();

      const current = response.current();
      const daily = response.daily();

      const weatherData = {
        current: {
          time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
          temperature2m: current.variables(0).value(),
          relativeHumidity2m: current.variables(1).value(),
          precipitation: current.variables(2).value(),
          rain: current.variables(3).value(),
          windSpeed10m: current.variables(4).value(),
        },
        daily: {
          time: range(
            Number(daily.time()),
            Number(daily.timeEnd()),
            daily.interval()
          ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
          temperature2mMax: daily.variables(0).valuesArray(),
          temperature2mMin: daily.variables(1).valuesArray(),
        },
      };
      setData(weatherData);
      const res = await axios.post("/api/weather", {
        weatherData,
        longitude,
        latitude,
      });
      const res1 = await axios.post("/api/health", {
        weatherData,
        longitude,
        latitude,
      });
      console.log(res1.data);
      setRes(res.data);
      setRes1(res1.data);
    }
    fetch();
  }, []);

  return (
    <RootLayout>
      <div className="min-h-screen w-full bg-black/80 flex-col gap-2 flex items-center justify-center">
        {data && (
          <div className="flex flex-col bg-white rounded p-4 w-full max-w-xs">
            <div className="font-bold text-xl">Chennai</div>
            <div className="text-sm text-gray-500">
              {data.current.time.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              {data.current.time.toLocaleTimeString("en-US")}
            </div>
            <div className="mt-6 text-6xl self-center inline-flex items-center justify-center rounded-lg text-indigo-400 h-24 w-24">
              <svg
                className="w-32 h-32"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                ></path>
              </svg>
            </div>
            <div className="flex flex-row items-center justify-center mt-6">
              <div className="font-medium text-6xl">
                {data.current.temperature2m.toFixed(2)}°
              </div>
              <div className="flex flex-col items-center ml-6">
                <div>Cloudy</div>
                <div className="mt-1">
                  <span className="text-sm">
                    <i className="far fa-long-arrow-up"></i>
                  </span>
                  <span className="text-sm font-light text-gray-500">
                    {Math.max(...data.daily.temperature2mMax).toFixed(2)}°C
                  </span>
                </div>
                <div>
                  <span className="text-sm">
                    <i className="far fa-long-arrow-down"></i>
                  </span>
                  <span className="text-sm font-light text-gray-500">
                    {Math.min(...data.daily.temperature2mMin).toFixed(2)}°C
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-6">
              <div className="flex flex-col items-center">
                <div className="font-medium text-sm">Wind</div>
                <div className="text-sm text-gray-500">
                  {data.current.windSpeed10m.toFixed(2)} k/h
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="font-medium text-sm">Humidity</div>
                <div className="text-sm text-gray-500">
                  {data.current.relativeHumidity2m.toFixed(2)}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="font-medium text-sm">Precipitation</div>
                <div className="text-sm text-gray-500">
                  {data.current.precipitation.toFixed(2)} mm
                </div>
              </div>
            </div>
          </div>
        )}
        <div className=" flex justify-center items-center h-full w-full">
          {res && (
            <div className="flex flex-col justify-between items-center h-full w-full">
              <h1 className="text-4xl font-extrabold text-cyan-300">
                Recommended Outfits
              </h1>
              <Outfit outfits={res.message}></Outfit>
            </div>
          )}
          {res1 && (
            <div className="flex h-full flex-col justify-between items-center w-full">
              <h1 className="text-4xl font-extrabold text-cyan-300">
                Wellness Measures
              </h1>
              <HealthCard
                HealthPrecautions={res1.message.HealthPrecautions}
                MedicineList={res1.message.MedicineList}
              ></HealthCard>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
