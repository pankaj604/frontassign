import React, { useEffect, useState } from "react";
import axisData from "../files/axis.json";
import iciciData from "../files/icici.json";
import hdfcData from "../files/hdfc.json";
const Statements = ({ onBanksSelected }) => {
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [statements, setStatements] = useState([]);

  useEffect(() => {
    // Function to load JSON data for a selected bank
    const loadBankData = async (bank) => {
      try {
        const response = await import(`../files/${bank}.json`);
        return response.default;
      } catch (error) {
        console.error(`Error loading data for ${bank}: ${error}`);
        return [];
      }
    };


    const loadSelectedBankData = async () => {
      const bankDataPromises = selectedBanks.map((bank) => loadBankData(bank));
      const bankData = await Promise.all(bankDataPromises);
      const mergedData = bankData.flat();
      setStatements(mergedData);
    };

    loadSelectedBankData();
  }, [selectedBanks]);

  const handleBankSelect = (bank) => {
    if (selectedBanks.includes(bank)) {
      setSelectedBanks(
        selectedBanks.filter((selectedBank) => selectedBank !== bank)
      );
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  const handleSearch = () => {
    if (Array.isArray(statements)) {
      const results = statements.filter(
        (entry) =>
          entry.Description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!startDate || new Date(entry.Date) >= new Date(startDate)) &&
          (!endDate || new Date(entry.Date) <= new Date(endDate))
      );
      setSearchResults(results);
    }
  };

  return (
    <div>
      <div className="App">
        <h1>Bank Statement Search</h1>
        <div>
          <label>Select Banks: </label>
          <label>
            <input
              type="checkbox"
              value="axis"
              checked={selectedBanks.includes("axis")}
              onChange={() => handleBankSelect("axis")}
            />{" "}
            Axis Bank
          </label>
          <label>
            <input
              type="checkbox"
              value="icici"
              checked={selectedBanks.includes("icici")}
              onChange={() => handleBankSelect("icici")}
            />{" "}
            ICICI Bank
          </label>
          <label>
            <input
              type="checkbox"
              value="hdfc"
              checked={selectedBanks.includes("hdfc")}
              onChange={() => handleBankSelect("hdfc")}
            />{" "}
            HDFC Bank 
          </label> 
          <button className="btn" onClick={handleSearch}>Search</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="date"> start date = </label>
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
                    <label htmlFor="date"> end date = </label>
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <ul>
          {searchResults.map((result, index) => (
            <li key={index}>
              Date = {result.Date}: ,  {result.Description} - Debit: {result.Debit}  , 
              Credit: {result.Credit || 0}  ,  Balance: {result.Balance}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Statements;
