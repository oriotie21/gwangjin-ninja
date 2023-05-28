const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const elasticsearch = require("elasticsearch");

// Elasticsearch 클라이언트 생성
const client = new elasticsearch.Client({
  host: "localhost:9200",
});

app.use(bodyParser.json());
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/api/hitsjson", (req, res) => {
  // Elasticsearch 쿼리 실행
  client
    .search({
      index: "network-log",
      size: 100,
      body: {
        sort: [
          {
            "data.timestamp": {
              order: "desc",
            },
          },
        ],
        query: {
          bool: {
            filter: [
              {
                match: {
                  tags: "json",
                },
              },
              {
                bool: {
                  must_not: [
                    {
                      term: {
                        "data.src_ip": "127.0.0.1",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    })
    .then((response) => {
      // Elasticsearch로부터의 응답 처리
      const hits = response.hits.hits;
      //console.log(hits); // 데이터 확인을 위해 콘솔에 출력

      res.json(hits); // JSON 형식으로 데이터 응답
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/api/hitsjson_duration", (req, res) => {
  // Get the values of "lte" and "gte" from the request query parameters
  const lte = req.query.lte;
  const gte = req.query.gte;
  console.log(gte, lte);
  // Elasticsearch query execution
  client
    .search({
      index: "network-log",
      size: 100,
      body: {
        sort: [
          {
            "data.timestamp": {
              order: "desc",
            },
          },
        ],
        query: {
          bool: {
            filter: [
              {
                match: {
                  tags: "json",
                },
              },
              {
                bool: {
                  must_not: [
                    {
                      term: {
                        "data.src_ip": "127.0.0.1",
                      },
                    },
                  ],
                },
              },
              {
                range: {
                  "data.timestamp": {
                    gte: gte,
                    lte: lte,
                  },
                },
              },
            ],
          },
        },
      },
    })
    .then((response) => {
      // Process the response from Elasticsearch
      const hits = response.hits.hits;
      //console.log(hits); // Print data to the console for verification

      res.json(hits); // Respond with data in JSON format
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/api/hitscsv", (req, res) => {
  // Elasticsearch 쿼리 실행
  client
    .search({
      index: "network-log",
      size: 100,
      q: "tags:csv",
    })
    .then((response) => {
      // Elasticsearch로부터의 응답 처리
      const hits = response.hits.hits;
      console.log(hits); // 데이터 확인을 위해 콘솔에 출력

      res.json(hits); // JSON 형식으로 데이터 응답
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/api/hitscsv_duration", (req, res) => {
  // Get the values of "lte" and "gte" from the request query parameters
  const lte = req.query.lte;
  const gte = req.query.gte;
  console.log(gte, lte);
  // Elasticsearch query execution
  client
    .search({
      index: "network-log",
      size: 100,
      body: {
        sort: [
          {
            "data.timestamp": {
              order: "desc",
            },
          },
        ],
        query: {
          bool: {
            filter: [
              {
                match: {
                  tags: "csv",
                },
              },
              {
                range: {
                  "data.timestamp": {
                    gte: gte,
                    lte: lte,
                  },
                },
              },
            ],
          },
        },
      },
    })
    .then((response) => {
      const hits = response.hits.hits;
      console.log(hits); // Print data to the console for verification

      res.json(hits); // Respond with data in JSON format
    })
    .catch((error) => {
      console.error(error);
    });
});

const geoip = require("geoip-lite");
app.post("/api/ipcountry", (req, res) => {
  const { ipAddress } = req.body;
  const geo = geoip.lookup(ipAddress);
  console.log(ipAddress);
  if (geo) {
    const latitude = geo.ll[0]; // 위도
    const longitude = geo.ll[1]; // 경도
    console.log(latitude, longitude);
    res.send({ latitude, longitude });
  } else {
    res.status(404).send("IP not found");
  }
});

const exec = require("child_process").execSync;
const iconv = require("iconv-lite");
// 네트워크 인터페이스 목록 가져오기 API 엔드포인트
app.get("/api/networkInterfaces", (req, res) => {
  const cmd = "netsh interface show interface";
  let rs = exec(cmd);
  rs = iconv.decode(rs, "euc-kr");
  const interfaces = rs.split("\r\n"); // 각 줄을 분리하여 배열로 저장
  const interfaceNames = [];

  // 인터페이스 이름 추출
  for (let i = 3; i < interfaces.length - 2; i++) {
    const line = interfaces[i];
    const words = line.split(/\s{2,}/); // 공백이 두 칸 이상인 것을 기준으로 단어를 나눔
    const interfaceName = words[words.length - 1]; // 마지막 단어를 추출
    interfaceNames.push(interfaceName);
  }

  console.log(interfaceNames);
  res.send(interfaceNames);
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
