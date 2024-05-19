import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/App.css";
import "./css/water.css";
import "./css/forecast.css";
import "./css/loading.css";
import BarChart from "./components/BarChart";
import Prototype from "./image/Prototype.png";

function App() {
  let result = [];
  let level = [];
  let Time = [];
  let Status = [];

  let [bgColor, setColor] = useState("white");
  let [bgColor2, setColor2] = useState("white");
  let [TextInfo, setTextinfo] = useState("-");
  let [value, setValue] = useState(0);
  let [dataforecast, forecastval] = useState([]);
  let [datawater, grapwater] = useState([]);
  let [datatime, graptime] = useState([]);
  let [loader, loaderstatus] = useState("block");

  const [userData, setUserData] = useState({
    labels: [],
    datasets: [],
  });

  //Load Data From Sheet
  const [csvData, setCsvData] = useState([]);
  const fetchCSVData = () => {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJn2O1JWt797FqYWW5TJmU0uPB3ustW4pTvzrFtyheKZ0PyTn4-JTU--npjXIUdtLiITcTmgs_tyBB/pub?output=csv"; // Replace with your Google Sheets CSV file URL
    axios
      .get(csvUrl)
      .then((response) => {
        const parsedCsvData = parseCSV(response.data);
        setCsvData(parsedCsvData);

        const newValue = parseInt(
          parsedCsvData[parsedCsvData.length - 1]["Water"]
        );

        forecasts(parsedCsvData);
        // forecastval(parsedCsvData);
        // dataforecast = parsedCsvData;

        parsedCsvData = [];
      })
      .catch((error) => {
        // Handle errors
      });
  };

  function parseCSV(csvText) {
    const rows = csvText.split(/\r?\n/); // Split CSV text into rows, handling '\r' characters
    const headers = rows[0].split(","); // Extract headers (assumes the first row is the header row)
    const data = []; // Initialize an array to store parsed data
    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i].split(","); // Split the row, handling '\r' characters
      const rowObject = {};
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = rowData[j];
      }
      data.push(rowObject);
    }
    return data;
  }

  function forecasts(data) {
    let Color = "#87c13c";
    result = [];
    // Assuming data is an array of objects

    // Loop through the data array
    setValue(parseInt(data[data.length - 1]["Water"]));
    for (let i = data.length - 1; i >= Math.max(0, data.length - 7); i--) {
      level.push(parseInt(data[i]["Water"]));
      Time.push(data[i]["Time"]);

      // Determine status based on water level
      let currentLevel = parseInt(data[i]["Water"]);
      if (currentLevel <= 1) {
        Status.push("ปลอดภัย");
        Color = "#87c13c";
      } else if (currentLevel <= 2) {
        Status.push("ควรระวัง");
        Color = "#fdd64b";
      } else if (currentLevel <= 3) {
        Status.push("เสี่ยง");
        Color = "#ff9b57";
      } else {
        Status.push("วิกฤต");
        Color = "#fe6a69";
      }

      // Push relevant data to result array
      result.push({
        Time: Time[Time.length - 1],
        status: Status[Status.length - 1],
        levelinfo: level[level.length - 1],
        Color: Color,
      });
    }

    // Log the arrays for debugging
    // console.log(level);
    // console.log(Time);
    // console.log(Status);

    grapwater(level);
    graptime(Time);
    forecastval(result);
    console.log(result);
    setUserData({
      labels: result.map((data) => data.Time),
      datasets: [
        {
          label: "ระดับน้ำ",
          data: result.map((data) => data.levelinfo),
          backgroundColor: result.map((data) => data.Color),
          borderColor: "black",
          borderWidth: 2,
        },
      ],
    });
    loaderstatus("none");
  }

  useEffect(() => {
    fetchCSVData();
  }, []);

  useEffect(() => {
    // Check the value and set the color accordingly
    if (value <= 1) {
      setTextinfo("ปลอดภัย");

      setColor("#87c13c");
      setColor2("#a8e05f");
    } else if (value <= 2 && value > 1) {
      setTextinfo("ควรระวัง");

      setColor("#fdd64b");
      setColor2("#efbe1d");
    } else if (value <= 3 && value > 2) {
      setTextinfo("เสี่ยง");

      setColor("#ff9b57");
      setColor2("#f27e2f");
    } else {
      setTextinfo("วิกฤต");

      setColor("#fe6a69");
      setColor2("#e84b50");
    }
  }, [value]); // Run this effect whenever the value changes

  return (
    <div className="App-header">
      <div className="loading" style={{ display: loader }}>
        Loading&#8230;
      </div>
      <div className="NavBar">
        <h1 className="NavText" onClick={() => {window.location.href = "https://utok-noi.vercel.app/"}} >U TOK NOI</h1>
      </div>
      <div className="Content">
        <div
          className="aqi-overview__summary"
          style={{ backgroundColor: bgColor2 }}
        >
          <div class="aqi-value-wrapper">
            <div className="aqi-value" style={{ backgroundColor: bgColor }}>
              <p className="aqi-value__unit"> ระดับน้า x 10 (เมตร)</p>
              <p className="aqi-value__value">{value}</p>
            </div>
            <p className="aqi-status">
              <span className="aqi-status__label">สถานะ</span>
              <br />
              <span className="aqi-status__text">{TextInfo}</span>
            </p>
          </div>
        </div>
        <p1 className="more-txt">เพิ่มเติม</p1>
        <div className="more-box">
          <p1 className="info-txt">ระดับน้ำย้อนหลัง 7 วัน</p1>
        </div>

        <div className="forecast">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Water</th>
              </tr>
            </thead>
            <tbody>
              {dataforecast.map((item, index) => (
                <tr key={index}>
                  <td>{item.Time}</td>
                  <td className="box" style={{ backgroundColor: item.Color }}>
                    <span className="status"> {item.status} </span>
                    <span className="levelinfo">
                      {item.levelinfo} เมตร
                    </span>{" "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="Content" id="ChartContent">
        <div className="ChartContainer">
          <BarChart chartData={userData} />
        </div>
      </div>
      <div className="Content" id="PrototypeBox">
        <img src={Prototype} alt="Prototype" className="QuarterImage" />
        <div className="InformationText">
          <span id="info">
            รายละเอียดโครงงาน
            <br />
            วัสดุ/อุปกรณ์ที่เลือกใช้
          </span>
          <br />
          1.ตู้แก้ว
          <br />
          2.แท่งพลาสติก
          <br />
          3.พาวเวอร์แบงค์
          <br />
          4.บอร์ด KB 32i
          <br />
          5.บอร์ด KB μAI <br />
          6.สีผสมอาหาร
          <br />
          7.กาวร้อน
          <br />
        </div>
      </div>
      <footer className="footer">
        Copyright ©2024 U TOK NOI
        <br />
        <span>Developed by: Pheemmpong, Pongsinachai, Tanaanan, Peerapas</span>
      </footer>
    </div>
  );
}

export default App;
