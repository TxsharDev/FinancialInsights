import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import FinancialData from "./components/FinancialData";
import STOCKS from "./libs/stocks";
import "./css/App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: "",
      selectedSymbol: "",
      favorites: [],
      apiKey:
        localStorage.getItem("alphaVantageApiKey") ||
        process.env.REACT_APP_ALPHA_VANTAGE_API_KEY ||
        "",
      showApiKeyForm:
        !localStorage.getItem("alphaVantageApiKey") &&
        !process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
    };

    // Bind the method to the component instance
    this.handleApiKeySubmit = this.handleApiKeySubmit.bind(this);
  }
  componentDidMount() {
    // Check if alphaVantageApiKey exists in local storage
    let apiKey = localStorage.getItem("alphaVantageApiKey");

    // If alphaVantageApiKey does not exist in local storage or its value is an empty string
    if (!apiKey || apiKey === "") {
      // Check the environment variable for the API key
      const envApiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

      // If envApiKey exists, set alphaVantageApiKey in local storage to the value from envApiKey
      if (envApiKey) {
        localStorage.setItem("alphaVantageApiKey", envApiKey);
      }
    }

    // Update the state with the retrieved or newly set API key
    this.setState({ apiKey });

    // Load favorites from local storage on component mount
    this.loadFavorites();
  }

  // Load favorites from local storage
  loadFavorites = () => {
    const storedFavorites = localStorage.getItem("favoriteStocks");
    if (storedFavorites) {
      this.setState({ favorites: JSON.parse(storedFavorites) });
    }
  };

  // Cleanup empty entries in local storage
  cleanUpLocalStorage = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value === "{}") {
        localStorage.removeItem(key);
      }
    }
  };

  // Handle symbol input change
  handleSymbolChange = (event) => {
    this.setState({ symbol: event.target.value.toUpperCase() });
  };

  // Handle stock search button click
  handleSearch = () => {
    const { symbol } = this.state;
    if (symbol.trim() !== "") {
      this.setState({ selectedSymbol: symbol });
    }
  };

  // Handle click on stored ticker
  handleStoredTickerClick = (ticker) => {
    this.cleanUpLocalStorage();
    this.setState({ symbol: ticker, selectedSymbol: ticker });
  };

  // Add selected symbol to favorites
  handleAddToFavorites = () => {
    const { selectedSymbol, favorites } = this.state;
    if (selectedSymbol && !favorites.includes(selectedSymbol)) {
      const updatedFavorites = [...favorites, selectedSymbol];
      this.setState({ favorites: updatedFavorites }, () => {
        localStorage.setItem(
          "favoriteStocks",
          JSON.stringify(updatedFavorites)
        );
      });
    }
  };

  // Remove ticker from favorites
  handleRemoveFromFavorites = (ticker) => {
    const { favorites } = this.state;
    const updatedFavorites = favorites.filter((fav) => fav !== ticker);
    this.setState({ favorites: updatedFavorites }, () => {
      localStorage.setItem("favoriteStocks", JSON.stringify(updatedFavorites));
    });
  };

  handleApiKeyChange = (event) => {
    const apiKey = event.target.value;
    this.setState({ apiKey });
  };

  handleApiKeySubmit = (event) => {
    event.preventDefault();
    const { apiKey } = this.state;
    if (!apiKey || apiKey.length < 10) {
      localStorage.setItem("alphaVantageApiKey", null);
      this.setState({ showApiKeyForm: false, apiKey: "" });
    } else {
      localStorage.setItem("alphaVantageApiKey", apiKey);
      this.setState({ showApiKeyForm: false, apiKey });
    }
  };

  handleReplaceApiKey = () => {
    this.setState({ showApiKeyForm: true, apiKey: "" });
  };

  render() {
    const { symbol, selectedSymbol, favorites, apiKey, showApiKeyForm } =
      this.state;
    const hasApiKey =
      apiKey !== null || process.env.REACT_APP_ALPHA_VANTAGE_API_KEY !== null;

    return (
      <div>
        {/* Navbar */}
        <Navbar expand="lg" className="custom-navbar">
          <Navbar.Brand href="/" className="brand">
            Financial Insights
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="https://www.txshar.com/" className="nav-link">
                txshar.com
              </Nav.Link>
              <Nav.Link href="https://www.txchflix.com/" className="nav-link">
                txchflix.com
              </Nav.Link>
              {showApiKeyForm ? (
                <span className="verticalLine">
                  <Nav.Item>
                    <Form className="ml-auto">
                      <Form.Group controlId="apiKeyInput">
                        <Form.Control
                          type="text"
                          value={apiKey}
                          onChange={this.handleApiKeyChange}
                          placeholder="Enter Alpha Vantage API Key"
                          size="sm"
                          className="mr-4 placeholder-text"
                        />

                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          onClick={this.handleApiKeySubmit}
                        >
                          Submit
                        </Button>
                      </Form.Group>
                    </Form>
                  </Nav.Item>
                </span>
              ) : (
                <span className="verticalLine">
                  <Nav.Item className="ml-auto">
                    {hasApiKey ? (
                      <>
                        {localStorage.getItem("alphaVantageApiKey") !==
                        "null" ? (
                          <>
                            Current API Key: <br />
                            {localStorage.getItem("alphaVantageApiKey")}
                          </>
                        ) : (
                          "No API Key Set"
                        )}
                        <Button
                          variant="nav-link"
                          onClick={this.handleReplaceApiKey}
                        >
                          Replace API Key
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="nav-link"
                        onClick={() => this.setState({ showApiKeyForm: true })}
                      >
                        Set API Key
                      </Button>
                    )}
                  </Nav.Item>
                </span>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {/* Main Content */}
        <Container className="app-container mt-4">
          <Row>
            {/* Favorites Section */}
            <Col md={12}>
              {favorites.length > 0 && (
                <Card className="mt-4">
                  <Card.Body>
                    <h5>Favorites</h5>
                    <div className="favorites-container">
                      <ul className="list-group list-group-horizontal">
                        {favorites.map((ticker) => (
                          <li
                            key={ticker}
                            className="list-group-item d-flex flex-column align-items-center"
                          >
                            <span
                              className="clickable-ticker mb-2"
                              onClick={() =>
                                this.handleStoredTickerClick(ticker)
                              }
                            >
                              {ticker}
                            </span>
                            <div>
                              <Button
                                variant="danger"
                                size="sm"
                                className="mb-2"
                                onClick={() =>
                                  this.handleRemoveFromFavorites(ticker)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
          {/* Top 100 Stocks Section */}
          <Row>
            <Col xs={12}>
              <Card className="mt-4">
                <Card.Body className="d-flex flex-column">
                  <h5 className="mb-3">Top 100 Stocks</h5>
                  <div className="stocks-container">
                    <ul className="list-group list-group-horizontal">
                      {STOCKS.slice(0, 100).map((ticker) => (
                        <li
                          key={ticker}
                          className="list-group-item clickable-ticker"
                          onClick={() => this.handleStoredTickerClick(ticker)}
                        >
                          {ticker}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Search Section */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="formBasicSymbol">
                      <Form.Label>Enter a stock symbol</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter symbol"
                        value={symbol}
                        onChange={this.handleSymbolChange}
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      <Button variant="primary" onClick={this.handleSearch}>
                        Search
                      </Button>
                      {selectedSymbol && (
                        <Button
                          variant="success"
                          onClick={this.handleAddToFavorites}
                          disabled={favorites.includes(selectedSymbol)}
                        >
                          {favorites.includes(selectedSymbol)
                            ? "Added to Favorites"
                            : "Add To Favorites"}
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Financial Data Section */}
          <Row>
            <Col md={12}>
              {selectedSymbol && (
                <div className="financial-data-container mt-4">
                  <FinancialData
                    symbol={selectedSymbol}
                    onRemoveFavorite={this.handleRemoveFromFavorites}
                    apiKey={
                      hasApiKey
                        ? apiKey || process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
                        : ""
                    }
                  />
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default App;