import React, { Component } from "react";
import { Row, Col, Button, Card } from "react-bootstrap";
import DataPrepService from "../services/DataPrepService";
import FinancialChart from "./FinancialChart";
import "../css/App.css";

class FinancialData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      financialData: null,
      loading: true,
      dataSource: "",
      buttonText: "Refresh Data",
      apiKey: localStorage.getItem("alphaVantageApiKey"),
      apiKeyValidated: false,
    };
  }
  componentDidMount() {
    // Fetch financial data when component mounts
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // Re-fetch financial data if the symbol prop changes
    if (prevProps.symbol !== this.props.symbol) {
      this.fetchData();
    }
  }

  async fetchData() {
    const { symbol } = this.props;
    try {
      // Set loading state and button text
      this.setState({ loading: true, buttonText: "Loading..." });
      let data;
      let dataSource;

      // Check local storage for cached financial data
      const balanceSheetData = localStorage.getItem(
        `financialData_${symbol}_BALANCE_SHEET`
      );
      const incomeStatementData = localStorage.getItem(
        `financialData_${symbol}_INCOME_STATEMENT`
      );

      if (balanceSheetData && incomeStatementData) {
        // If data found in local storage, use it
        data = {
          balanceSheet: JSON.parse(balanceSheetData),
          incomeStatement: JSON.parse(incomeStatementData),
        };
        dataSource = `Data retrieved from local storage (${symbol})`;
      } else {
        // Otherwise, fetch data from API
        if (localStorage.getItem("alphaVantageApiKey") === "null") {
          data = await DataPrepService.getFinancialData(symbol);
          // Cache fetched data in local storage
          localStorage.setItem(
            `financialData_${symbol}_BALANCE_SHEET`,
            JSON.stringify(data.balanceSheet)
          );
          localStorage.setItem(
            `financialData_${symbol}_INCOME_STATEMENT`,
            JSON.stringify(data.incomeStatement)
          );
        } else {
          data = await DataPrepService.getFinancialData(symbol);
          dataSource = "Data Source: Data fetched from API Endpoint";
          // Cache fetched data in local storage
          localStorage.setItem(
            `financialData_${symbol}_BALANCE_SHEET`,
            JSON.stringify(data.balanceSheet)
          );
          localStorage.setItem(
            `financialData_${symbol}_INCOME_STATEMENT`,
            JSON.stringify(data.incomeStatement)
          );
        }
      }

      // Update state with fetched data
      this.setState({
        financialData: data,
        loading: false,
        dataSource: dataSource,
        buttonText: "Refresh Data",
      });
    } catch (error) {
      // Handle errors
      console.error("Error fetching financial data:", error);
      this.setState({
        loading: false,
        dataSource: "Failed to fetch data",
        buttonText: "Refresh Data",
      });
    }
  }

  handleRefresh = async () => {
    // Refresh financial data when refresh button is clicked
    const { symbol } = this.props;
    try {
      this.setState({ loading: true, buttonText: "Loading..." });
      let data = await DataPrepService.getFinancialData(symbol);
      this.setState({
        financialData: data,
        loading: false,
        dataSource: "Data refreshed from Alpha Vantage API",
        buttonText: "Refresh Data",
      });
      // Update local storage with refreshed data
      localStorage.setItem(`financialData_${symbol}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching financial data:", error);
      this.setState({
        loading: false,
        dataSource: "Failed to refresh data",
        buttonText: "Refresh Data",
      });
    }
  };

  renderFinancialData() {
    const { financialData, loading } = this.state;
    if (loading) {
      return <div>Loading financial data...</div>;
    }

    if (
      !financialData ||
      !financialData.incomeStatement ||
      !financialData.balanceSheet
    ) {
      return <div>No financial data available.</div>;
    }
    const incomeStatementData = financialData.incomeStatement.rows;
    const balanceSheetData = financialData.balanceSheet.rows;
    return (
      <>
        <Row>
          <Col>
            <h3>Income Statement Analysis:</h3>
            {incomeStatementData && incomeStatementData.length > 0 ? (
              <FinancialChart data={incomeStatementData} />
            ) : (
              <div>No income statement data available.</div>
            )}
            <hr />
            <h3>Balance Sheet Analysis:</h3>
            {balanceSheetData && balanceSheetData.length > 0 ? (
              <FinancialChart data={balanceSheetData} />
            ) : (
              <div>No balance sheet data available.</div>
            )}
          </Col>
        </Row>
      </>
    );
  }

  render() {
    const { loading, buttonText, dataSource } = this.state;
    const { symbol, companyName } = this.props;

    return (
      <div>
        <Card>
          <Card.Body>
            <Row>
              <Col>
                {/* Display company symbol and name */}
                <h4>
                  <a
                    href={`https://finance.yahoo.com/quote/${symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="symbol-link"
                  >
                    {symbol}
                  </a>{" "}
                  - {companyName} Financial Data
                </h4>
                {/* Refresh button */}
                <Button
                  variant="primary"
                  onClick={this.handleRefresh}
                  disabled={loading}
                  className="mr-2 mt-2"
                >
                  {buttonText}
                </Button>

                {/* Data Source */}
                <div className="mt-2">
                  <small>{dataSource}</small>
                </div>
                <hr />
              </Col>
            </Row>
            {this.renderFinancialData()}
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default FinancialData;