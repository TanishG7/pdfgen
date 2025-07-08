# HTML-to-PDF Generation Microservice

*A high-performance service for converting HTML to PDF with direct cloud storage upload.*

---

## Key Features
- **Blazing Fast** - Generates PDFs in under 1 second (90th percentile)
- **Resource Efficient** - Intelligent browser/page pooling (5 browsers, 10 pages each)
- **Seamless Storage** - Direct upload to external storage services
- **Production Ready** - Helmet security, CORS, and request sanitization
- **Observability** - Built-in metrics, health checks, and structured logging

---

## Tech Stack
| Component       | Technology |
|-----------------|------------|
| Core Framework  | Express.js |
| PDF Generation  | Puppeteer  |
| Resource Pooling| generic-pool |
| Logging         | Winston    |
| Security        | Helmet     |
| Compression     | compression|


## Workflow Flowchart

```mermaid
flowchart TD
    A[Client Request] --> B{Validate Input}
    B -->|Valid| C[Decode Base64 HTML]
    B -->|Invalid| D[Return 400 Error]
    C --> E[Acquire Browser from Pool]
    E --> F[Acquire Page from Pool]
    F --> G[Set Page Content]
    G --> H[Wait for DOM Load]
    H --> I[Generate PDF Buffer]
    I --> J[Release Page]
    J --> K[Release Browser]
    K --> L{Upload to Storage?}
    L -->|Yes| M[POST to Storage API]
    L -->|No| N[Return PDF]
    M --> O[Return Storage Response]
    D --> P[Log Error]
    P --> Q[Return 500 Error]
