const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get Players API 1
app.get("/players", async (req, res) => {
  const getPlayersQuery = `
    SELECT
      *
    From
      cricket_team
    ORDER BY
      player_id;`;

  const playersArray = await db.all(getPlayersQuery);

  res.send(
    playersArray.map((eachPlayer) => {
      const newObj = {};
      const listOfKeys = Object.keys(eachPlayer);
      listOfKeys.map((eachKey) => {
        const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
          chr.toUpperCase()
        );
        newObj[key] = eachPlayer[eachKey];
      });
      return newObj;
    })
  );
});

// Add Player API 2
app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
        '${role}'
      );`;
  await db.run(addPlayerQuery);
  res.send("Player Added to Team");
});

// Get Player by Id API 3
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayersQuery = `SELECT * FROM cricket_team WHERE player_Id = ${playerId};`;
  const player = await db.get(getPlayersQuery);
  const getPlayer = {};
  const listOfKeys = Object.keys(player);
  listOfKeys.map((eachKey) => {
    const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
      chr.toUpperCase()
    );
    getPlayer[key] = player[eachKey];
  });
  res.send(getPlayer);
});


// Update Player API 4
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
  UPDATE 
   cricket_team
  SET
   player_name='${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}'
  WHERE
   player_Id = ${playerId}`;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

// Delete Player API 5
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_Id = ${playerId};`;
  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
