import React from "react";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const SecondQuestion = () => {
    
    const [selectedBanks, setSelectedBanks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categories, setCategories] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [statements, setStatements] = useState([]);
  
    useEffect(() => {
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
        setSelectedBanks(selectedBanks.filter((selectedBank) => selectedBank !== bank));
      } else {
        setSelectedBanks([...selectedBanks, bank]);
      }
    };
  
    const handleSearch = () => {
      if (Array.isArray(statements)) {
        const results = statements.filter((entry) =>
          entry.Description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!startDate || new Date(entry.Date) >= new Date(startDate)) &&
          (!endDate || new Date(entry.Date) <= new Date(endDate))
        );
        setSearchResults(results);
      }
    };
  
    const handleCategoryInput = (e) => {
      setCategories(e.target.value);
    };
  
    const getAggregatedData = () => {
      const categoriesArray = categories.split(',').map((category) => category.trim());
      const aggregatedData = {};
  
      categoriesArray.forEach((category) => {
        const categoryData = searchResults.filter((entry) =>
          entry.Description.toLowerCase().includes(category.toLowerCase())
        );
  
        const totalDebit = categoryData.reduce(
          (accumulator, entry) => accumulator + parseFloat(entry.Debit),
          0
        );
        const totalCredit = categoryData.reduce(
          (accumulator, entry) => accumulator + parseFloat(entry.Credit),
          0
        );
  
        aggregatedData[category] = {
          totalDebit,
          totalCredit,
        };
      });
  
      return aggregatedData;
    };
  
    const getRandomColor = () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    };
  
    // Generate data for the line chart
    const getChartData = () => {
      const chartData = {
        labels: searchResults.map((entry) => entry.Date),
        datasets: [],
      };
  
      // Create a dataset for each category
      categories.split(',').map((category) => {
        const data = searchResults.map((entry) => {
          const categoryData = entry.Description.toLowerCase().includes(category.trim().toLowerCase())
            ? parseFloat(entry.Debit) - parseFloat(entry.Credit)
            : 0;
          return categoryData;
        });
  
        chartData.datasets.push({
          label: category,
          data,
          borderColor: getRandomColor(),
          fill: false,
        });
        return null;
      });
  
      return chartData;
    };
  
    // Function to create a line chart using plain JavaScript
    useEffect(() => {
      if (categories && searchResults.length > 0) {
        const chartData = getChartData();
        const ctx = document.getElementById('line-chart').getContext('2d');
  
        new window.Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }, [searchResults, categories]);
  
    return (
      <div className="App">
        <h1> Bank Statement Search with aggregate data</h1>
        <div>
          <label>Select Banks: </label>
          <label>
            <input
              type="checkbox"
              value="axis"
              checked={selectedBanks.includes('axis')}
              onChange={() => handleBankSelect('axis')}
            /> Axis Bank
          </label>
          <label>
            <input
              type="checkbox"
              value="icici"
              checked={selectedBanks.includes('icici')}
              onChange={() => handleBankSelect('icici')}
            /> ICICI Bank
          </label>
          <label>
            <input
              type="checkbox"
              value="hdfc"
              checked={selectedBanks.includes('hdfc')}
              onChange={() => handleBankSelect('hdfc')}
            /> HDFC Bank
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
        
          <input
            type="text"
            placeholder="Enter Categories (comma-separated)"
            value={categories}
            onChange={handleCategoryInput}
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
              {result.Date}: {result.Description} - Debit: {result.Debit} -
              Credit: {result.Credit} - Balance: {result.Balance}
            </li>
          ))}
        </ul>
        <div className="chart-container">
          {/* Display line chart using plain HTML and JavaScript */}
          <canvas id="line-chart"></canvas>
        </div>
        <div className="aggregated-data">
          {categories && (
            <div>
              <h2>Aggregated Data</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Debit</th>
                    <th>Total Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(getAggregatedData()).map((category, index) => (
                    <tr key={index}>
                      <td>{category}</td>
                      <td>{getAggregatedData()[category].totalDebit}</td>
                      <td>{getAggregatedData()[category].totalCredit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );

};

export default SecondQuestion;
