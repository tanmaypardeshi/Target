import {
  Grid,
  Paper,
  Typography,
  makeStyles,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableContainer,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Table,
} from "@material-ui/core";
import Axios from "axios";
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import DataGrid, { TextEditor } from "react-data-grid";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    fontSize: "20px",
  },
  backDrop: {
    backdropFilter: "blur(3px)",
    backgroundColor: "rgba(69,69,69,0.9)",
  },
}));

export default function TabPanel({ subject }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState(null);
  const [table, setTable] = useState(true);
  const [text, setText] = useState(false);
  const [number, setNumber] = useState(0);
  const [sub, setSub] = useState(subject);
  let [rollNumber, setRollNumber] = useState("");
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [totalBool, setTotalBool] = useState(false);
  const [total, setTotal] = useState({
    tco1: 0,
    tco2: 0,
    tco3: 0,
    tco4: 0,
    tco5: 0,
    tco6: 0,
    tsppu: 0,
  });

  const columns = [
    { key: "roll_no", name: "Roll Number", editable: false },
    { key: "co1", name: "CO 1", editor: TextEditor, editable: !submitted },
    { key: "co2", name: "CO 2", editor: TextEditor, editable: !submitted },
    { key: "co3", name: "CO 3", editor: TextEditor, editable: !submitted },
    { key: "co4", name: "CO 4", editor: TextEditor, editable: !submitted },
    { key: "co5", name: "CO 5", editor: TextEditor, editable: !submitted },
    { key: "co6", name: "CO 6", editor: TextEditor, editable: !submitted },
    { key: "sppu", name: "SPPU", editor: TextEditor, editable: !submitted },
  ];

  const generateRoll = (div, year) => {
    let roll = "";

    if (year === 2) roll = "2";
    else if (year === 3) roll = "3";
    else if (year === 4) roll = "4";

    roll += "3";

    if (div === 9) roll += "1";
    else if (div === 10) roll += "2";
    else if (div === 11) roll += "3";

    roll += "01";

    return roll;
  };

  const getMarks = (sub) => {
    if (token) {
      let final = "";
      let div = sub.division;
      if (div === 9) {
        div = "09";
      }
      if (parseInt(sub.year) === 2) final += "SE" + div;
      else if (parseInt(sub.year) === 3) final += "TE" + div;
      else final += "BE" + div;
      Axios.get(
        `http://localhost:8000/api/marks/get/${final}/${sub.subId}/${sub.acadYear}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => {
          if (res.data.data.length > 0) {
            setNumber(res.data.data.length);
            setText(true);
            setTable(true);
            setRows(res.data.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      Axios.get(
        `http://localhost:8000/api/marks/submit/${sub.subId}/${sub.division}/${sub.acadYear}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => {
          if (res.data.data[0].submitted === 1) {
            setSubmitted(true);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleChange = (e) => {
    setNumber(e.target.value);
    if (parseInt(e.target.value) > 0) setTable(false);
  };

  const handleAdd = () => {
    let newArray = [...rows];
    let startIndex =
      rows[rows.length - 1] === undefined ? 0 : rows[rows.length - 1];
    let endIndex = startIndex + number;
    for (let i = startIndex; i < endIndex; i++) {
      newArray.push({
        roll_no: rollNumber++,
        co1: "",
        co2: "",
        co3: "",
        co4: "",
        co5: "",
        co6: "",
        sppu: "",
      });
    }
    setRows(newArray);
    setTable(true);
  };

  const handleSave = () => {
    let final = [...rows];
    final.map((row) => {
      row.roll_no = parseInt(row.roll_no);
      row.co1 = row.co1 === "" || row.co1 === "A" ? null : parseInt(row.co1);
      row.co2 = row.co2 === "" || row.co2 === "A" ? null : parseInt(row.co2);
      row.co3 = row.co3 === "" || row.co3 === "A" ? null : parseInt(row.co3);
      row.co4 = row.co4 === "" || row.co4 === "A" ? null : parseInt(row.co4);
      row.co5 = row.co5 === "" || row.co5 === "A" ? null : parseInt(row.co5);
      row.co6 = row.co6 === "" || row.co6 === "A" ? null : parseInt(row.co6);
      row.sppu =
        row.sppu === "" || row.sppu === "A" ? null : parseInt(row.sppu);
    });
    Axios.post(
      `http://localhost:8000/api/marks/add/${subject.subId}/${subject.acadYear}`,
      { marks: final },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        enqueueSnackbar("Saved and Updated Your Entries", {
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar("Could Not Save Your Data", { variant: "error" });
      });
  };

  const handleOpen = () => {
    setOpen(!open);
  };
  const handleSubmit = () => {
    let final = [...rows];
    final.map((row) => {
      row.roll_no = parseInt(row.roll_no);
      row.co1 = row.co1 === "" || row.co1 === "A" ? null : parseInt(row.co1);
      row.co2 = row.co2 === "" || row.co2 === "A" ? null : parseInt(row.co2);
      row.co3 = row.co3 === "" || row.co3 === "A" ? null : parseInt(row.co3);
      row.co4 = row.co4 === "" || row.co4 === "A" ? null : parseInt(row.co4);
      row.co5 = row.co5 === "" || row.co5 === "A" ? null : parseInt(row.co5);
      row.co6 = row.co6 === "" || row.co6 === "A" ? null : parseInt(row.co6);
      row.sppu =
        row.sppu === "" || row.sppu === "A" ? null : parseInt(row.sppu);
    });
    Axios.post(
      `http://localhost:8000/api/marks/submit/${subject.subId}/${subject.division}/${subject.acadYear}`,
      { marks: final },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((r) => {
        enqueueSnackbar("Submitted Data Successfully", { variant: "success" });
        setOpen(!open);
        setText(true);
        setTable(true);
        setSubmitted(true);
      })
      .catch(() => {
        enqueueSnackbar("Could Not Submit Your Data", { variant: "error" });
      });
  };

  const getTotalMarks = (subId, acadYear) => {
    Axios.get(
      `http://localhost:8000/api/subject/get/total/${subId}/${acadYear}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("usertoken")}`,
        },
      }
    )
      .then((res) => {
        if (res.data.data[0].tco1 !== null) {
          setTotalBool(true);
          setTotal(res.data.data[0]);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setToken(sessionStorage.getItem("usertoken"));
    setSub(subject);
  }, [subject]);

  useEffect(() => {
    setRows([]);
    setNumber(0);
    setText(false);
    setSubmitted(false);
    getMarks(sub);
    getTotalMarks(sub.subId, sub.acadYear);
  }, [token, sub]);

  useEffect(() => {
    setRollNumber(
      generateRoll(parseInt(subject.division), parseInt(subject.year))
    );
  }, [subject.division, subject.year]);

  return (
    <div style={{ padding: "2%" }}>
      <Typography variant="h3">Subject Details</Typography>
      <Grid container spacing={1} style={{ padding: "2%", paddingLeft: "0" }}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>Subject ID : {subject.subId}</Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            Subject Name : {subject.subName}
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>Year : {subject.year}</Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>Divison : {subject.division}</Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            Coordinator : {parseInt(subject.role_id) === 2 ? "Yes" : "No"}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">CO 1</TableCell>
                  <TableCell align="center">CO 2</TableCell>
                  <TableCell align="center">CO 3</TableCell>
                  <TableCell align="center">CO 4</TableCell>
                  <TableCell align="center">CO 5</TableCell>
                  <TableCell align="center">CO 6</TableCell>
                  <TableCell align="center">SPPU</TableCell>
                </TableRow>
              </TableHead>
              {!total.tco1 ? (
                <TableBody>
                  <TableRow>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                    <TableCell align="center">N/A</TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell align="center">{total.tco1}</TableCell>
                    <TableCell align="center">{total.tco2}</TableCell>
                    <TableCell align="center">{total.tco3}</TableCell>
                    <TableCell align="center">{total.tco4}</TableCell>
                    <TableCell align="center">{total.tco5}</TableCell>
                    <TableCell align="center">{total.tco6}</TableCell>
                    <TableCell align="center">{total.tsppu}</TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={8}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="nos"
            label={`Enter number of students in ${
              subject.year === 2 ? "SE" : subject.year === 3 ? "TE" : "BE"
            } ${subject.division}`}
            name="students"
            autoComplete="students"
            value={number}
            disabled={text}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            disabled={table}
            variant="contained"
            color="primary"
            style={{ padding: "2%", marginTop: "5%" }}
            onClick={handleAdd}
          >
            Add Table
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            Enter marks here: {submitted ? "(Marks have been submitted)" : ""}
          </Typography>
          <br />
          <DataGrid
            columns={columns}
            rows={rows}
            rowKeyGetter={(row) => row.id}
            onRowsChange={setRows}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            disabled={number === 0 || submitted ? true : false}
            variant="contained"
            color="primary"
            style={{ marginTop: "2%" }}
            onClick={handleSave}
          >
            Save marks
          </Button>
          <Button
            disabled={number === 0 || submitted ? true : false}
            variant="contained"
            color="primary"
            style={{ margin: "2% 0% 0% 2%" }}
            onClick={handleOpen}
          >
            Submit Marks
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleOpen}
        BackdropProps={{
          classes: {
            root: classes.backDrop,
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">{"Save your data?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to submit the marks? This step is
            irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpen} color="primary">
            No
          </Button>
          <Button onClick={handleSubmit} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
