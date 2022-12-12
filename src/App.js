import React, {useEffect, useState} from "react";

import Board from "./Components/Board/Board";

import "./App.css";
import {Data} from "./Components/Data";
import * as XLSX from 'xlsx'
import Editable from "./Components/Editabled/Editable";

function App() {
  const [excelFile, setExcelFile]=useState(null);
  const [excelFileError, setExcelFileError]=useState(null);

  // submit
  const [excelData, setExcelData]=useState(null);

  const [boards, setBoards]=useState(
    JSON.parse(localStorage.getItem("prac-kanban"))||[]
  );

  const [targetCard, setTargetCard]=useState({
    bid: "",
    cid: "",
  });

  const addboardHandler=(name) => {
    const tempBoards=[...boards];
    tempBoards.push({
      id: Date.now()+Math.random()*2,
      title: name,
      cards: [],
    });
    setBoards(tempBoards);
  };

  const removeBoard=(id) => {
    const index=boards.findIndex((item) => item.id===id);
    if (index<0) return;

    const tempBoards=[...boards];
    tempBoards.splice(index, 1);
    setBoards(tempBoards);
  };

  const addCardHandler=(id, title) => {
    const index=boards.findIndex((item) => item.id===id);
    if (index<0) return;

    const tempBoards=[...boards];
    tempBoards[index].cards.push({
      id: Date.now()+Math.random()*2,
      title,
      labels: [],
      date: "",
      tasks: [],
    });
    setBoards(tempBoards);
  };

  const removeCard=(bid, cid) => {
    const index=boards.findIndex((item) => item.id===bid);
    if (index<0) return;

    const tempBoards=[...boards];
    const cards=tempBoards[index].cards;

    const cardIndex=cards.findIndex((item) => item.id===cid);
    if (cardIndex<0) return;

    cards.splice(cardIndex, 1);
    setBoards(tempBoards);
  };

  const dragEnded=(bid, cid) => {
    let s_boardIndex, s_cardIndex, t_boardIndex, t_cardIndex;
    s_boardIndex=boards.findIndex((item) => item.id===bid);
    if (s_boardIndex<0) return;

    s_cardIndex=boards[s_boardIndex]?.cards?.findIndex(
      (item) => item.id===cid
    );
    if (s_cardIndex<0) return;

    t_boardIndex=boards.findIndex((item) => item.id===targetCard.bid);
    if (t_boardIndex<0) return;

    t_cardIndex=boards[t_boardIndex]?.cards?.findIndex(
      (item) => item.id===targetCard.cid
    );
    if (t_cardIndex<0) return;

    const tempBoards=[...boards];
    const sourceCard=tempBoards[s_boardIndex].cards[s_cardIndex];
    tempBoards[s_boardIndex].cards.splice(s_cardIndex, 1);
    tempBoards[t_boardIndex].cards.splice(t_cardIndex, 0, sourceCard);
    setBoards(tempBoards);

    setTargetCard({
      bid: "",
      cid: "",
    });
  };

  const dragEntered=(bid, cid) => {
    if (targetCard.cid===cid) return;
    setTargetCard({
      bid,
      cid,
    });
  };

  const updateCard=(bid, cid, card) => {
    const index=boards.findIndex((item) => item.id===bid);
    if (index<0) return;

    const tempBoards=[...boards];
    const cards=tempBoards[index].cards;

    const cardIndex=cards.findIndex((item) => item.id===cid);
    if (cardIndex<0) return;

    tempBoards[index].cards[cardIndex]=card;

    setBoards(tempBoards);
  };

  useEffect(() => {
    localStorage.setItem("prac-kanban", JSON.stringify(boards));
  }, [boards]);

  const fileType=['application/vnd.ms-excel'];
  const handleFile=(e) => {
    let selectedFile=e.target.files[0];
    if (selectedFile) {
      // console.log(selectedFile.type);
      if (selectedFile&&fileType.includes(selectedFile.type)) {
        let reader=new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload=(e) => {
          setExcelFileError(null);
          setExcelFile(e.target.result);
        }
      }
      else {
        setExcelFileError('Please select only excel file types');
        setExcelFile(null);
      }
    }
    else {
      console.log('plz select your file');
    }
  }

  // submit function
  const handleSubmit=(e) => {
    e.preventDefault();
    if (excelFile!==null) {
      const workbook=XLSX.read(excelFile, {type: 'buffer'});
      const worksheetName=workbook.SheetNames[0];
      const worksheet=workbook.Sheets[worksheetName];
      const data=XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
    }
    else {
      setExcelData(null);
    }
  }


  return (
    <div className="app">
      <div className="app_nav">
        <h1>Core Project</h1>
        <div className="container">

          {/* upload file section */}
          <div className='form'>
            <form className='form-group' autoComplete="off"
              onSubmit={handleSubmit}>
              <label><h5>Upload Excel file</h5></label>
              <br></br>
              <input type='file' className='form-control'
                onChange={handleFile} required></input>
              {excelFileError&&<div className='text-danger'
                style={{marginTop: 5+'px'}}>{excelFileError}</div>}
              <button type='submit' className='btn btn-success'
                style={{marginTop: 5+'px', height: "25px", width: "70px", borderRadius: "4px", fontWeight: "700", backgroundColor: "green", color: "white"}}>Submit</button>
            </form>
          </div>

          <br></br>
          <hr></hr>

          {/* view file section */}
          <h5>View Excel file</h5>
          <div className='viewer'>
            {excelData===null&&<>No file selected</>}
            {excelData!==null&&(
              <div className='table-responsive'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th scope='col'>ID</th>
                      <th scope='col'>First Name</th>
                      <th scope='col'>Last Name</th>
                      <th scope='col'>Gender</th>
                      <th scope='col'>Country</th>
                      <th scope='col'>Age</th>
                      <th scope='col'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Data excelData={excelData} />
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
      <div className="app_boards_container">
        <div className="app_boards">
          {boards.map((item) => (
            <Board
              key={item.id}
              board={item}
              addCard={addCardHandler}
              removeBoard={() => removeBoard(item.id)}
              removeCard={removeCard}
              dragEnded={dragEnded}
              dragEntered={dragEntered}
              updateCard={updateCard}
            />
          ))}
          <div className="app_boards_last">
            <Editable
              displayClass="app_boards_add-board"
              editClass="app_boards_add-board_edit"
              placeholder="Enter Board Name"
              text="Add Board"
              buttonText="Add Board"
              onSubmit={addboardHandler}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
