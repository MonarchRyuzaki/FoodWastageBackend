import axios from "axios";

export class SparqlClient {
  constructor({ prefixes, endpoint, updateUrl = null, defaultHeaders = {} }) {
    this.prefixes = prefixes || "";
    this.queryUrl = endpoint;
    this.updateUrl = updateUrl || endpoint + "/statements";
    this.headers = {
      Accept: "application/sparql-results+json",
      ...defaultHeaders,
    };
  }

  async query(q, { params = {}, headers = {} } = {}) {
    const response = await axios.get(this.queryUrl, {
      params: { query: `${this.prefixes}${q}`, ...params },
      headers: { ...this.headers, ...headers },
    });
    return response.data;
  }

  async update(q, { params = {}, headers = {} } = {}) {
    const response = await axios.post(
      this.updateUrl,
      new URLSearchParams({ update: `${this.prefixes}${q}` }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...this.headers,
          ...headers,
        },
      }
    );
    return response.data;
  }
}

export function createFoodWastageSparqlClient() {
  return new SparqlClient({
    prefixes: `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX : <https://w3id.org/foodwaste/ontology#>
    `,
    endpoint: "http://localhost:7200/repositories/FoodWastage",
    updateUrl: "http://localhost:7200/repositories/FoodWastage/statements",
    defaultHeaders: {
      Accept: "application/sparql-results+json",
    },
  });
}
