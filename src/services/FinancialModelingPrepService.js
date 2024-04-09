import axios from "axios";

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";
const DOLT_SQL_ENDPOINT = "https://www.dolthub.com/api/v1alpha1/post-no-preference/earnings/master";

class FinancialModelingPrepService {
  /**
   * Fetches financial data from the specified source (Alpha Vantage API or Dolt SQL endpoint).
   * @param {string} symbol - The stock symbol.
   * @param {string} functionName - The function name for the financial data (e.g., "BALANCE_SHEET", "INCOME_STATEMENT").
   * @returns {Promise<object>} A promise that resolves to the financial data.
   */
  static async fetchData(symbol, functionName) {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: functionName,
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      });

      if (
        response.data.Information &&
        response.data.Information.includes("Thank you for using Alpha Vantage!")
      ) {
        console.log(
          "Alpha Vantage API rate limit reached. Switching to Dolt SQL endpoint."
        );
        return await this.fetchDataFromDolt(symbol, functionName);
      }

      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch ${functionName} data from Alpha Vantage:`,
        error
      );
      console.log("Switching to Dolt SQL endpoint.");
      return await this.fetchDataFromDolt(symbol, functionName);
    }
  }

  /**
   * Fetches financial data from the Dolt SQL endpoint.
   * @param {string} symbol - The stock symbol.
   * @param {string} functionName - The function name for the financial data (e.g., "BALANCE_SHEET", "INCOME_STATEMENT").
   * @returns {Promise<object>} A promise that resolves to the financial data.
   */
  static async fetchDataFromDolt(symbol, functionName) {
    try {
      const tableName = functionName === "BALANCE_SHEET" ? "balance_sheet_assets" : "income_statement";
      const response = await axios.get(DOLT_SQL_ENDPOINT, {
        params: {
          q: `SELECT * FROM \`${tableName}\` WHERE \`act_symbol\` = '${symbol}' ORDER BY \`date\` ASC, \`act_symbol\` ASC, \`period\` ASC LIMIT 1000;`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch data from Dolt SQL endpoint:", error);
      throw error;
    }
  }

  /**
   * Retrieves financial data (balance sheet and income statement) for the specified stock symbol.
   * @param {string} symbol - The stock symbol.
   * @returns {Promise<object>} A promise that resolves to an object containing the balance sheet and income statement data.
   */
  static async getFinancialData(symbol) {
    try {
      const [balanceSheetData, incomeStatementData] = await Promise.all([
        this.fetchData(symbol, "BALANCE_SHEET"),
        this.fetchData(symbol, "INCOME_STATEMENT"),
      ]);

      return { balanceSheet: balanceSheetData, incomeStatement: incomeStatementData };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default FinancialModelingPrepService;