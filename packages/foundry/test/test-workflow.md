# Test Workflow Diagrams

## Project Tests Workflow

```mermaid
graph TD
    A[Project Tests] --> B[Create Project]
    B --> C[Update Project]
    C --> D[Update Metadata]
    D --> E[Update Status]
    B --> F[Get User Projects]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
```

## Token Tests Workflow

```mermaid
graph TD
    A[Token Tests] --> B[Create Project Token]
    B --> C[Token Distribution]
    C --> D[Initial Token Claim]
    D --> E[Vesting Schedule]
    E --> F[Multiple Contributors]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
```

## Crowdfunding Tests Workflow

```mermaid
graph TD
    A[Crowdfunding Tests] --> B[Initialize Funding]
    B --> C[Contribute]
    C --> D[Check Progress]
    D --> E{Goal Met?}
    E -->|Yes| F[Success]
    E -->|No| G[Failure]
    G --> H[Refund]
    F --> I[Token Distribution]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#fbb,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
    style G fill:#fbb,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#bfb,stroke:#333,stroke-width:2px
```

## Task Market Tests Workflow

```mermaid
graph TD
    A[Task Tests] --> B[Create Task]
    B --> C[Apply for Task]
    C --> D[Assign Task]
    D --> E[Start Task]
    E --> F[Complete Task]
    F --> G[Verify Task]
    G --> H[Reward Distribution]

    B -.-> I[Multiple Applications]
    F -.-> J[Revision Request]
    J --> F

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
    style H fill:#bfb,stroke:#333,stroke-width:2px
    style I fill:#ddd,stroke:#333,stroke-width:2px,stroke-dasharray: 5
    style J fill:#fbb,stroke:#333,stroke-width:2px,stroke-dasharray: 5
```

## Integration Test Flow

```mermaid
graph TD
    A[Integration Tests] --> B[Create Project]
    B --> C[Initialize Funding]
    C --> D[Contribute]
    D --> E[Create Tasks]
    E --> F[Assign & Complete Tasks]
    F --> G[Verify & Reward]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
```

Colors Legend:
- 🟣 Test Suite Entry Point
- 🔵 Standard Test Steps
- 🔴 Error/Failure Cases
- 🟢 Success/Completion Steps
- ⚪ Optional/Alternative Flows